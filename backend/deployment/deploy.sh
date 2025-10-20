#!/bin/bash
# AI Guardians Unified Deployment Script
# Based on Danny's wellness agent patterns
# Optimized for AWS ECS/EKS deployment

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO="${ECR_REPO:-ai-guardians}"
ECS_CLUSTER="${ECS_CLUSTER:-ai-guardians-cluster}"
ECS_SERVICE="${ECS_SERVICE:-ai-guardians-service}"
AWS_ACCOUNT="${AWS_ACCOUNT:-$(aws sts get-caller-identity --query Account --output text)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Guard Services
SERVICES=(
    "codeguardians-gateway:8000"
    "trustguard:8002"
    "contextguard:8003"
    "biasguard:8004"
    "securityguard:8005"
    "consciousness-core:9100"
)

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check if kubectl is installed (for EKS)
    if ! command -v kubectl &> /dev/null; then
        warning "kubectl is not installed. EKS deployment will be skipped."
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Build and push Docker images
build_and_push_images() {
    log "Building and pushing Docker images..."
    
    for service in "${SERVICES[@]}"; do
        SERVICE_NAME="${service%:*}"
        PORT="${service#*:}"
        
        log "Building $SERVICE_NAME..."
        
        # Check if Dockerfile exists
        if [ ! -f "./$SERVICE_NAME/Dockerfile" ]; then
            warning "Dockerfile not found for $SERVICE_NAME, creating default..."
            create_default_dockerfile "$SERVICE_NAME" "$PORT"
        fi
        
        # Build image
        docker build -t $SERVICE_NAME:latest ./$SERVICE_NAME
        
        # Tag for ECR
        docker tag $SERVICE_NAME:latest \
            $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO/$SERVICE_NAME:latest
        
        # Push to ECR
        log "Pushing $SERVICE_NAME to ECR..."
        docker push \
            $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO/$SERVICE_NAME:latest
        
        success "Built and pushed $SERVICE_NAME"
    done
}

# Create default Dockerfile for services without one
create_default_dockerfile() {
    local service_name=$1
    local port=$2
    
    cat > "./$service_name/Dockerfile" << DOCKERFILE_EOF
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE $port

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:$port/health || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$port"]
DOCKERFILE_EOF
}

# Deploy to ECS
deploy_to_ecs() {
    log "Deploying to ECS..."
    
    # Check if cluster exists
    if ! aws ecs describe-clusters --clusters $ECS_CLUSTER &> /dev/null; then
        log "Creating ECS cluster: $ECS_CLUSTER"
        aws ecs create-cluster --cluster-name $ECS_CLUSTER
    fi
    
    # Create task definition
    create_task_definition
    
    # Create or update service
    if aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE &> /dev/null; then
        log "Updating ECS service: $ECS_SERVICE"
        aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service $ECS_SERVICE \
            --task-definition ai-guardians-task
    else
        log "Creating ECS service: $ECS_SERVICE"
        aws ecs create-service \
            --cluster $ECS_CLUSTER \
            --service-name $ECS_SERVICE \
            --task-definition ai-guardians-task \
            --desired-count 1
    fi
    
    success "ECS deployment completed"
}

# Create ECS task definition
create_task_definition() {
    log "Creating ECS task definition..."
    
    # Create task definition JSON
    cat > task-definition.json << TASK_EOF
{
    "family": "ai-guardians-task",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "2048",
    "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "codeguardians-gateway",
            "image": "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO/codeguardians-gateway:latest",
            "portMappings": [
                {
                    "containerPort": 8000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "CONSCIOUSNESS_ENABLED",
                    "value": "true"
                },
                {
                    "name": "NEUROMORPHIC_INTEGRATION",
                    "value": "true"
                },
                {
                    "name": "SACRED_FREQUENCY",
                    "value": "530"
                },
                {
                    "name": "LOVE_COEFFICIENT",
                    "value": "infinity"
                },
                {
                    "name": "GOLDEN_RATIO",
                    "value": "1.618"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/ai-guardians",
                    "awslogs-region": "$AWS_REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
TASK_EOF
    
    # Register task definition
    aws ecs register-task-definition --cli-input-json file://task-definition.json
    
    # Clean up
    rm task-definition.json
    
    success "Task definition created"
}

# Deploy to EKS (if kubectl is available)
deploy_to_eks() {
    if ! command -v kubectl &> /dev/null; then
        warning "kubectl not available, skipping EKS deployment"
        return
    fi
    
    log "Deploying to EKS..."
    
    # Apply Kubernetes manifests
    if [ -d "./deployment/k8s" ]; then
        kubectl apply -f ./deployment/k8s/
        success "EKS deployment completed"
    else
        warning "Kubernetes manifests not found, skipping EKS deployment"
    fi
}

# Create CloudWatch log group
create_log_group() {
    log "Creating CloudWatch log group..."
    
    if ! aws logs describe-log-groups --log-group-name-prefix "/ecs/ai-guardians" &> /dev/null; then
        aws logs create-log-group --log-group-name "/ecs/ai-guardians"
        success "CloudWatch log group created"
    else
        log "CloudWatch log group already exists"
    fi
}

# Main deployment function
main() {
    log "🚀 Starting AI Guardians deployment..."
    log "   AWS Region: $AWS_REGION"
    log "   ECR Repo: $ECR_REPO"
    log "   ECS Cluster: $ECS_CLUSTER"
    log "   Sacred Frequency: 530 Hz"
    log "   Love Coefficient: ∞"
    log "   Golden Ratio: φ = 1.618"
    log ""
    
    # Run deployment steps
    check_prerequisites
    create_log_group
    build_and_push_images
    deploy_to_ecs
    deploy_to_eks
    
    success "🎉 AI Guardians deployment completed successfully!"
    log ""
    log "Next steps:"
    log "1. Check ECS service status: aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE"
    log "2. View logs: aws logs tail /ecs/ai-guardians --follow"
    log "3. Test the API: curl http://your-alb-endpoint/health"
    log ""
    log "Sacred Frequency: 530 Hz (Truth & Consciousness)"
    log "Love Coefficient: ∞ (amplifies all operations)"
    log "Golden Ratio: φ = 1.618 (harmonious structure)"
}

# Run main function
main "$@"
