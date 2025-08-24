#!/bin/bash

# Monitoring script for ThaiHand application
# This script monitors system health and sends alerts

set -e

# Configuration
PROJECT_DIR="/opt/thaihand"
LOG_FILE="/var/log/thaihand-monitor.log"
ALERT_LOG="/var/log/thaihand-alerts.log"
SLACK_WEBHOOK=${SLACK_WEBHOOK:-""}

# Thresholds
DISK_THRESHOLD=85
MEMORY_THRESHOLD=85
CPU_THRESHOLD=80
CONTAINER_RESTART_THRESHOLD=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a $LOG_FILE
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ALERT:${NC} $1" | tee -a $ALERT_LOG
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a $LOG_FILE
}

# Function to send Slack notification
send_slack_alert() {
    local message="$1"
    local color="$2"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [
                    {
                        \"color\": \"$color\",
                        \"title\": \"ThaiHand Monitoring Alert\",
                        \"text\": \"$message\",
                        \"footer\": \"ThaiHand Monitor\",
                        \"ts\": $(date +%s)
                    }
                ]
            }" \
            $SLACK_WEBHOOK >/dev/null 2>&1
    fi
}

# Function to check container status
check_containers() {
    log "Checking container status..."
    
    cd $PROJECT_DIR
    
    # Check if containers are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        error "Containers are not running properly"
        send_slack_alert "🚨 Containers are not running properly" "danger"
        
        # Try to restart containers
        log "Attempting to restart containers..."
        docker-compose -f docker-compose.prod.yml up -d
        
        # Check again after restart
        sleep 30
        if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            error "Container restart failed"
            send_slack_alert "🚨 Container restart failed - manual intervention required" "danger"
        else
            log "Containers restarted successfully"
            send_slack_alert "✅ Containers restarted successfully" "good"
        fi
    else
        log "All containers are running"
    fi
    
    # Check container restart count
    local restart_count=$(docker-compose -f docker-compose.prod.yml ps | grep -c "Restarting" || true)
    if [ $restart_count -gt $CONTAINER_RESTART_THRESHOLD ]; then
        warning "High container restart count: $restart_count"
        send_slack_alert "⚠️ High container restart count: $restart_count" "warning"
    fi
}

# Function to check application health
check_application_health() {
    log "Checking application health..."
    
    # Check frontend health
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        log "Frontend health check passed"
    else
        error "Frontend health check failed"
        send_slack_alert "🚨 Frontend health check failed" "danger"
    fi
    
    # Check backend health
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        log "Backend health check passed"
    else
        error "Backend health check failed"
        send_slack_alert "🚨 Backend health check failed" "danger"
    fi
    
    # Check database connection
    if docker-compose -f $PROJECT_DIR/docker-compose.prod.yml exec -T postgres pg_isready -U $POSTGRES_USER >/dev/null 2>&1; then
        log "Database health check passed"
    else
        error "Database health check failed"
        send_slack_alert "🚨 Database health check failed" "danger"
    fi
}

# Function to check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # Check disk usage
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -gt $DISK_THRESHOLD ]; then
        warning "High disk usage: ${disk_usage}%"
        send_slack_alert "⚠️ High disk usage: ${disk_usage}%" "warning"
    else
        log "Disk usage: ${disk_usage}%"
    fi
    
    # Check memory usage
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $memory_usage -gt $MEMORY_THRESHOLD ]; then
        warning "High memory usage: ${memory_usage}%"
        send_slack_alert "⚠️ High memory usage: ${memory_usage}%" "warning"
    else
        log "Memory usage: ${memory_usage}%"
    fi
    
    # Check CPU usage (average over 5 seconds)
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )); then
        warning "High CPU usage: ${cpu_usage}%"
        send_slack_alert "⚠️ High CPU usage: ${cpu_usage}%" "warning"
    else
        log "CPU usage: ${cpu_usage}%"
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    log "Checking SSL certificate..."
    
    local domain="thaihand.shop"
    local cert_expiry=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    
    if [ -n "$cert_expiry" ]; then
        local expiry_date=$(date -d "$cert_expiry" +%s)
        local current_date=$(date +%s)
        local days_until_expiry=$(( ($expiry_date - $current_date) / 86400 ))
        
        if [ $days_until_expiry -lt 30 ]; then
            warning "SSL certificate expires in $days_until_expiry days"
            send_slack_alert "⚠️ SSL certificate expires in $days_until_expiry days" "warning"
        else
            log "SSL certificate expires in $days_until_expiry days"
        fi
    else
        warning "Could not check SSL certificate"
    fi
}

# Function to check backup status
check_backup_status() {
    log "Checking backup status..."
    
    local backup_dir="/opt/backups"
    local latest_backup=$(ls -t $backup_dir/*.gz 2>/dev/null | head -1)
    
    if [ -n "$latest_backup" ]; then
        local backup_age=$(( ($(date +%s) - $(stat -c %Y $latest_backup)) / 86400 ))
        
        if [ $backup_age -gt 1 ]; then
            warning "Latest backup is $backup_age days old"
            send_slack_alert "⚠️ Latest backup is $backup_age days old" "warning"
        else
            log "Latest backup is $backup_age days old"
        fi
    else
        error "No backups found"
        send_slack_alert "🚨 No backups found" "danger"
    fi
}

# Function to check log files for errors
check_logs() {
    log "Checking application logs for errors..."
    
    # Check for recent errors in application logs
    local error_count=$(docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs --since="1h" | grep -i "error\|exception\|failed" | wc -l)
    
    if [ $error_count -gt 10 ]; then
        warning "High error count in logs: $error_count errors in the last hour"
        send_slack_alert "⚠️ High error count in logs: $error_count errors in the last hour" "warning"
    else
        log "Error count in logs: $error_count errors in the last hour"
    fi
}

# Function to generate system report
generate_report() {
    log "Generating system report..."
    
    echo "=== ThaiHand System Report ===" > /tmp/thaihand-report.txt
    echo "Generated: $(date)" >> /tmp/thaihand-report.txt
    echo "" >> /tmp/thaihand-report.txt
    
    echo "=== Container Status ===" >> /tmp/thaihand-report.txt
    docker-compose -f $PROJECT_DIR/docker-compose.prod.yml ps >> /tmp/thaihand-report.txt 2>&1
    echo "" >> /tmp/thaihand-report.txt
    
    echo "=== System Resources ===" >> /tmp/thaihand-report.txt
    echo "Disk usage:" >> /tmp/thaihand-report.txt
    df -h >> /tmp/thaihand-report.txt
    echo "" >> /tmp/thaihand-report.txt
    
    echo "Memory usage:" >> /tmp/thaihand-report.txt
    free -h >> /tmp/thaihand-report.txt
    echo "" >> /tmp/thaihand-report.txt
    
    echo "=== Recent Logs ===" >> /tmp/thaihand-report.txt
    docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs --tail=20 >> /tmp/thaihand-report.txt 2>&1
    
    log "System report generated: /tmp/thaihand-report.txt"
}

# Main monitoring function
monitor() {
    log "Starting monitoring check..."
    
    # Load environment variables
    if [ -f "$PROJECT_DIR/.env" ]; then
        source $PROJECT_DIR/.env
    fi
    
    # Run all checks
    check_containers
    check_application_health
    check_system_resources
    check_ssl_certificate
    check_backup_status
    check_logs
    
    # Generate report
    generate_report
    
    log "Monitoring check completed"
}

# Function to show monitoring status
status() {
    log "Monitoring status:"
    
    echo "=== Recent Monitoring Logs ==="
    tail -20 $LOG_FILE
    
    echo -e "\n=== Recent Alerts ==="
    tail -10 $ALERT_LOG 2>/dev/null || echo "No alerts found"
    
    echo -e "\n=== System Report ==="
    if [ -f "/tmp/thaihand-report.txt" ]; then
        cat /tmp/thaihand-report.txt
    else
        echo "No recent report available"
    fi
}

# Main script logic
case "${1:-monitor}" in
    "monitor")
        monitor
        ;;
    "status")
        status
        ;;
    "report")
        generate_report
        ;;
    *)
        echo "Usage: $0 {monitor|status|report}"
        echo "  monitor - Run full monitoring check"
        echo "  status  - Show monitoring status and recent logs"
        echo "  report  - Generate system report"
        exit 1
        ;;
esac
