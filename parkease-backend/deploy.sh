#!/bin/bash

# ParkEase Backend Deployment Script
# This script helps deploy the backend to Google Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}ParkEase Backend Deployment Script${NC}"
echo "=========================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No project ID found. Please set it:${NC}"
    read -p "Enter your GCP Project ID: " PROJECT_ID
    gcloud config set project $PROJECT_ID
fi

echo -e "${GREEN}Using project: ${PROJECT_ID}${NC}"

# Get database connection details
echo ""
echo -e "${YELLOW}Database Configuration:${NC}"
read -p "Database username (default: postgres): " DB_USERNAME
DB_USERNAME=${DB_USERNAME:-postgres}

read -sp "Database password: " DB_PASSWORD
echo ""

read -p "Cloud SQL instance connection name (format: PROJECT_ID:REGION:INSTANCE_NAME): " CLOUDSQL_INSTANCE
if [ -z "$CLOUDSQL_INSTANCE" ]; then
    echo -e "${RED}Error: Cloud SQL instance connection name is required${NC}"
    exit 1
fi

# Get JWT secret
echo ""
echo -e "${YELLOW}Security Configuration:${NC}"
read -sp "JWT Secret (or press Enter to generate): " JWT_SECRET
echo ""

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated JWT Secret: ${JWT_SECRET}${NC}"
    echo -e "${YELLOW}⚠️  Please save this secret securely!${NC}"
fi

# Get GCS bucket name
read -p "GCS Bucket name (default: parkease-spots): " GCS_BUCKET_NAME
GCS_BUCKET_NAME=${GCS_BUCKET_NAME:-parkease-spots}

# Construct DB URL
DB_URL="jdbc:postgresql:///parkease?cloudSqlInstance=${CLOUDSQL_INSTANCE}&socketFactory=com.google.cloud.sql.postgres.SocketFactory"

echo ""
echo -e "${GREEN}Deployment Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Database URL: $DB_URL"
echo "  Database User: $DB_USERNAME"
echo "  GCS Bucket: $GCS_BUCKET_NAME"
echo "  Cloud SQL Instance: $CLOUDSQL_INSTANCE"
echo ""

read -p "Continue with deployment? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable run.googleapis.com --quiet
gcloud services enable sqladmin.googleapis.com --quiet
gcloud services enable storage-api.googleapis.com --quiet

# Submit build
echo ""
echo -e "${YELLOW}Submitting build to Cloud Build...${NC}"
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_DB_URL="$DB_URL", \
  _DB_USERNAME="$DB_USERNAME", \
  _DB_PASSWORD="$DB_PASSWORD", \
  _JWT_SECRET="$JWT_SECRET", \
  _GCS_BUCKET_NAME="$GCS_BUCKET_NAME", \
  _CLOUDSQL_INSTANCE="$CLOUDSQL_INSTANCE"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "Getting service URL..."
    SERVICE_URL=$(gcloud run services describe parkease-backend \
      --region us-central1 \
      --format="value(status.url)" 2>/dev/null)
    
    if [ ! -z "$SERVICE_URL" ]; then
        echo -e "${GREEN}Backend URL: ${SERVICE_URL}${NC}"
        echo ""
        echo "Test the API:"
        echo "  curl ${SERVICE_URL}/"
    fi
else
    echo -e "${RED}❌ Deployment failed. Check the logs above.${NC}"
    exit 1
fi

