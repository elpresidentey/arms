# ARMS Security Documentation

## Overview
This document outlines the security measures implemented in the ARMS (Automated Refuse Management System) application.

## Security Features Implemented

### 1. **Authentication & Authorization**
- ✅ **Supabase Authentication**: Industry-standard OAuth 2.0 and JWT-based authentication
- ✅ **Role-Based Access Control (RBAC)**: Separate permissions for residents, admins, and staff
- ✅ **JWT Token Validation**: All API endpoints protected with JWT verification
- ✅ **Password Hashing**: bcrypt with salt rounds for secure password storage
- ✅ **Admin Invite System**: Controlled admin account creation via time-limited invite tokens
- ✅ **Session Management**: Automatic token expiration and refresh mechanisms

### 2. **Password Security**
- ✅ **Strong Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- ✅ **Password Reset Flow**: Secure email-based password reset with time-limited tokens
- ✅ **No Password Storage**: Passwords never stored in plain text

### 3. **API Security**

#### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP (production)
- **Authentication Endpoints**: 5 attempts per 15 minutes per IP
  - `/auth/login`
  - `/auth/register`
  - `/auth/forgot-password`

#### Input Validation
- ✅ **DTO Validation**: All inputs validated using class-validator
- ✅ **Whitelist Mode**: Unknown properties automatically stripped
- ✅ **Type Transformation**: Automatic type conversion and sanitization
- ✅ **Email Normalization**: All emails converted to lowercase and trimmed
- ✅ **SQL Injection Prevention**: TypeORM parameterized queries
- ✅ **XSS Prevention**: Input sanitization and output encoding

#### Security Headers (Helmet.js)
- ✅ **Content Security Policy (CSP)**: Restricts resource loading
- ✅ **X-Frame-Options**: Prevents clickjacking (DENY)
- ✅ **X-Content-Type-Options**: Prevents MIME sniffing
- ✅ **Strict-Transport-Security (HSTS)**: Forces HTTPS (31536000 seconds)
- ✅ **X-XSS-Protection**: Enables browser XSS filtering
- ✅ **Referrer-Policy**: Controls referrer information
- ✅ **X-Powered-By**: Header removed to hide technology stack

### 4. **CORS Configuration**
- ✅ **Origin Whitelist**: Only specified origins allowed
- ✅ **Credentials Support**: Secure cookie handling
- ✅ **Method Restrictions**: Only necessary HTTP methods allowed
- ✅ **Header Restrictions**: Limited allowed headers

### 5. **Data Protection**

#### Sensitive Data Handling
- ✅ **Password Exclusion**: Passwords never returned in API responses
- ✅ **Token Security**: JWT secrets stored in environment variables
- ✅ **Database Encryption**: SSL/TLS for database connections
- ✅ **Environment Variables**: All secrets in .env files (not committed)

#### Data Validation
- ✅ **Email Format**: RFC-compliant email validation
- ✅ **Phone Number Format**: International phone number validation
- ✅ **Name Validation**: Only letters, spaces, hyphens, and apostrophes
- ✅ **Length Limits**: Maximum lengths enforced on all text fields
- ✅ **Numeric Validation**: Type checking for numbers and coordinates

### 6. **Logging & Monitoring**

#### Security Logging
- ✅ **Failed Authentication Attempts**: Logged with IP and timestamp
- ✅ **Suspicious Activity Detection**: Pattern matching for common attacks
  - Path traversal attempts
  - SQL injection patterns
  - XSS attempts
  - Code injection patterns
  - Template injection
- ✅ **Slow Request Detection**: Potential DoS attempts logged
- ✅ **Error Monitoring**: Sentry integration for production error tracking

#### Logged Events
- Failed login attempts
- Suspicious request patterns
- Slow requests (>5 seconds)
- Authentication errors
- Authorization failures

### 7. **Network Security**
- ✅ **HTTPS Enforcement**: HSTS header forces HTTPS in production
- ✅ **Compression**: Response compression enabled
- ✅ **DNS Prefetch Control**: Disabled to prevent information leakage

### 8. **Application Security**

#### Frontend Security
- ✅ **Token Storage**: JWT stored in memory (AuthContext)
- ✅ **Automatic Logout**: On token expiration
- ✅ **Protected Routes**: Authentication required for app routes
- ✅ **Role-Based UI**: Different interfaces for residents vs admins

#### Backend Security
- ✅ **Guard Protection**: All routes protected by JWT guards
- ✅ **Role Guards**: Additional role-based authorization
- ✅ **Service Layer Validation**: Business logic validation
- ✅ **Database Constraints**: Foreign keys and unique constraints

## Security Best Practices

### For Developers

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, random values for secrets
   - Rotate secrets regularly
   - Use different secrets for dev/staging/production

2. **Password Requirements**
   ```
   Minimum 8 characters
   At least 1 uppercase letter
   At least 1 lowercase letter
   At least 1 number
   At least 1 special character
   ```

3. **API Development**
   - Always use DTOs with validation decorators
   - Never trust user input
   - Use parameterized queries (TypeORM handles this)
   - Validate and sanitize all inputs
   - Return minimal error information in production

4. **Authentication**
   - Always verify JWT tokens
   - Check user roles before allowing actions
   - Log failed authentication attempts
   - Implement rate limiting on auth endpoints

### For Deployment

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<strong-random-32+-character-string>
   BOOTSTRAP_ADMIN_TOKEN=<strong-random-32+-character-string>
   SESSION_SECRET=<strong-random-32+-character-string>
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **Database Security**
   - Enable SSL/TLS for database connections
   - Use strong database passwords
   - Restrict database access by IP
   - Regular backups with encryption

3. **Server Configuration**
   - Use HTTPS only (no HTTP)
   - Configure firewall rules
   - Keep dependencies updated
   - Regular security audits

4. **Monitoring**
   - Enable Sentry for error tracking
   - Monitor failed login attempts
   - Set up alerts for suspicious activity
   - Regular log reviews

## Security Checklist

### Pre-Production
- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure ALLOWED_ORIGINS for production domain
- [ ] Set NODE_ENV=production
- [ ] Enable Sentry error monitoring
- [ ] Configure database SSL
- [ ] Set up backup strategy
- [ ] Review and test rate limiting
- [ ] Test authentication flows
- [ ] Verify CORS configuration

### Post-Deployment
- [ ] Monitor error logs daily
- [ ] Review failed authentication attempts
- [ ] Check for suspicious activity patterns
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Conduct security audits
- [ ] Test disaster recovery
- [ ] Review access logs

## Vulnerability Reporting

If you discover a security vulnerability, please email: security@arms.local

**Do not** create public GitHub issues for security vulnerabilities.

## Compliance

### Data Protection
- User passwords are hashed and never stored in plain text
- Sensitive data is encrypted in transit (HTTPS)
- Database connections use SSL/TLS
- Personal data access is logged

### Authentication Standards
- OAuth 2.0 compliant (via Supabase)
- JWT tokens with expiration
- Secure password reset flow
- Multi-factor authentication ready (Supabase supports MFA)

## Security Updates

### Version History
- **v1.0.0** (2026-05-25): Initial security implementation
  - Rate limiting
  - Strong password validation
  - Enhanced helmet configuration
  - Security logging middleware
  - Input validation improvements
  - CORS hardening

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Supabase Security](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Contact

For security concerns or questions:
- Email: security@arms.local
- Support: support@arms.local

---

**Last Updated**: May 25, 2026  
**Maintained by**: IEL Security Team
