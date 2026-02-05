export default () => {
    process.env.COOKIE_DOMAIN="chs.local"
    process.env.COOKIE_NAME="__SID"
    process.env.COOKIE_SECRET="ChGovUk-XQrbf3sLj2abFxIY2TlapsJ"
    process.env.COOKIE_SECURE_ONLY=false
    process.env.DEFAULT_SESSION_EXPIRATION=3600
    process.env.CACHE_SERVER="localhost:1234"
};
