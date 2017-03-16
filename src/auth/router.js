const express = require('express');
const passport = require('passport');

const strategies = require('./strategies');

const checkOAuthProviderMiddleware = require('./check-oauth-provider-middleware')(strategies.providers);
const setUidCookieMiddleware = require('./set-uid-cookie-middleware')();

const authRouter = express.Router();

authRouter.get('/logout', logOut);
authRouter.get('/:provider', checkOAuthProviderMiddleware, authenticate);
authRouter.get('/:provider/callback', checkOAuthProviderMiddleware, authenticate, setUidCookieMiddleware, authRedirect);

function authenticate(req, res, next) {
    const { provider } = req.params;
    const strategyScope = strategies.scopes[provider];
    const authenticator = passport.authenticate(provider, strategyScope ? { scope: strategyScope } : null);

    authenticator(req, res, next);
}

function authRedirect(req, res) {
    const returnUrl = req.cookies['returnUrl'] || '/';

    res.clearCookie('returnUrl');

    res.redirect(returnUrl);
}

function logOut(req, res) {
    req.logout();

    res.clearCookie('secret');
    res.clearCookie('sessionId');
    res.redirect('/');
}

module.exports = authRouter;
