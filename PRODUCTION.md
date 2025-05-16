
# Production Deployment Guide

This document provides guidance for deploying this plagiarism detection and content rewriting app to production environments.

## Prerequisites

- Supabase account with edge functions enabled
- OpenAI API key with access to required models
- Production hosting environment (Vercel, Netlify, etc.)

## Environment Variables

The following environment variables must be configured in your production environment:

### Required Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase project anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key for AI-powered features

### Optional Variables

- `GOOGLE_CSE_ID` - Google Custom Search Engine ID for source matching (if using)
- `GOOGLE_CSE_API_KEY` - Google Custom Search API key (if using)
- `HUGGINGFACE_TOKEN` - Token for HuggingFace models (if using)

## Configuration Checklist

### Authentication

- [ ] Configure authentication providers in Supabase dashboard
- [ ] Set correct redirect URLs in auth settings
- [ ] Configure email templates if using email authentication
- [ ] Set appropriate security policies

### Edge Functions

Ensure all edge functions are deployed and functioning:

- [ ] `smart-content-rewriting`
- [ ] `academic-rewriter`
- [ ] `search-sources` (if using)
- [ ] `semantic-plagiarism-check` (if using)
- [ ] `analyze-writing-style` (if using)
- [ ] `batch-process-files` (if using)

### Database

- [ ] Apply all migrations
- [ ] Set up proper indices for performance
- [ ] Configure RLS (Row Level Security) policies
- [ ] Set up database backups

### Security

- [ ] Enable HTTPS only
- [ ] Set Content-Security-Policy headers
- [ ] Configure CORS appropriately
- [ ] Implement rate limiting
- [ ] Set up monitoring and logging

## Monitoring and Maintenance

### Critical Metrics to Monitor

- Edge function execution time and errors
- API rate limits (OpenAI, Google, etc.)
- Authentication success/failure rates
- Database performance

### Regular Maintenance Tasks

- Check OpenAI API usage and billing
- Review error logs weekly
- Update dependencies regularly
- Perform security audits quarterly

## Scaling Considerations

- Edge functions may need increased timeout limits for processing large documents
- Consider implementing queuing for batch processing jobs
- Implement caching strategies for frequently accessed results
- Add database read replicas if query volume increases significantly

## Troubleshooting

Common issues and their solutions:

1. **Edge Function Timeouts**
   - Increase `max_execution_time` in config.toml
   - Break large requests into smaller chunks

2. **OpenAI Rate Limits**
   - Implement request queuing
   - Add exponential backoff retry logic

3. **Performance Issues**
   - Check for N+1 query problems
   - Optimize database indices
   - Implement component-level code splitting

## Backup and Disaster Recovery

- Configure daily database backups
- Establish a recovery point objective (RPO)
- Document restoration procedures

## Legal and Compliance

- Ensure privacy policy covers AI content processing
- Set up data retention policies
- Address GDPR/CCPA requirements if applicable
- Consider academic integrity statements for educational users
