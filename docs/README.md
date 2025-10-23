# Frigate Middleware API Documentation

This directory contains comprehensive documentation for all API endpoints in the Frigate Middleware API.

## Overview

The Frigate Middleware API is a comprehensive service for Frigate surveillance dashboard with real-time phone violation detection, employee tracking, and attendance management.

## API Phases

### Phase 1: Foundation & Media ✅ COMPLETED
- **Health Check** - Service status and database connectivity
- **Root Endpoint** - API information and metadata
- **API Info** - Detailed configuration and features
- **Cameras List** - List all available cameras
- **Recent Recordings** - Video recordings with streaming URLs
- **Recent Clips** - Event clips with thumbnail URLs
- **Media Testing** - URL accessibility verification

### Phase 2: Camera Monitoring (Planned)
- Camera summaries and status
- Camera activity feeds
- Camera-specific violations
- Real-time monitoring

### Phase 3: Violations Tracking (Planned)
- Live phone violations
- Violation statistics and trends
- Duration analysis
- Camera-specific violations

### Phase 4: Employee Tracking (Planned)
- Employee status and work hours
- Activity timelines
- Break tracking
- Movement analysis

### Phase 5: Attendance & Zones (Planned)
- Attendance reporting
- Zone occupancy
- Activity heatmaps
- Zone statistics

### Phase 6: Dashboard & Admin (Planned)
- Dashboard summaries
- System status
- Cache management
- Background tasks

## Documentation Structure

Each API endpoint has its own markdown file with:

- **Endpoint** - HTTP method and path
- **Description** - What the endpoint does
- **Phase** - Which implementation phase
- **Parameters** - Query and path parameters
- **Request/Response Examples** - Real examples with data
- **Database Queries** - SQL queries used
- **Implementation Notes** - Key technical details
- **Testing** - How to test the endpoint
- **Error Handling** - Common errors and status codes

## Quick Start

1. **Health Check**: `GET /v1/health`
2. **List Cameras**: `GET /v1/api/cameras/list`
3. **Recent Recordings**: `GET /v1/api/recent-media/recordings?limit=5`
4. **Recent Clips**: `GET /v1/api/recent-media/clips?limit=5`

## Base URL

- **Development**: `http://localhost:5002`
- **Production**: `http://10.0.20.8:5002`

## Authentication

Currently no authentication required. All endpoints are publicly accessible.

## Database Access

- **Frigate PostgreSQL**: READ-ONLY access to detection events and media metadata
- **Local MongoDB**: READ/WRITE access for cache, analytics, and user data

## Media Streaming

Video and image files are served through a proxy to the Frigate video server:
- **Base URL**: `http://10.0.20.6:8000`
- **Proxy Path**: `/media/*`
- **Supported Formats**: MP4, WebP, JPG, PNG

## Testing

All endpoints have been tested with real data from the Frigate database. No mock data is used.

## Status

- ✅ **Phase 1**: Complete and tested
- 🔄 **Phase 2-6**: In development

## Support

For questions or issues, contact: admin@frigate-dashboard.com
