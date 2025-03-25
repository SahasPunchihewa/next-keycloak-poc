import Keycloak, { KeycloakLogoutOptions } from 'keycloak-js';

class KeycloakService {
    // To make the dynamic configuration work, we need to initialize the Keycloak instance with some default values.
    public static keycloak: Keycloak = new Keycloak({
        realm: 'myRealm',
        url: 'http://localhost:8000/auth',
        clientId: 'myClientId',
    });

    private static getEnvConfig = async () => {
        try {
            const response = await fetch("/api/env")
            return await response.json()
        } catch (error) {
            console.error("Failed to load environment config:", error)
        }
        return undefined
    }

    public static initKeycloak = async (onAuthenticatedCallback: () => void) => {
        const envConfig = await this.getEnvConfig()

        if (envConfig) {
            this.keycloak = new Keycloak({
                url: envConfig.NEXT_PUBLIC_KEYCLOAK_URL,
                realm: envConfig.NEXT_PUBLIC_KEYCLOAK_REALM,
                clientId: envConfig.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
            })
        }

        this.keycloak
            .init({
                onLoad: 'check-sso',
                checkLoginIframe: false,
            })
            .then(() => {
                onAuthenticatedCallback();
            })
            .catch(err => {
                console.error(err);
            });
    };

    public static updateToken = async (validity: number) => await this.keycloak.updateToken(validity);

    public static getLoginUrl = () => this.keycloak.createLoginUrl();

    public static register = () => this.keycloak.register();

    public static doLogin = () => this.keycloak.login();

    public static doLogout = async (options?: KeycloakLogoutOptions) => {
        localStorage.removeItem('userId');
        await this.keycloak.logout(options);
    };

    public static getToken = async () => {
        if (this.keycloak.authenticated) {
            if (this.keycloak.isTokenExpired()) {
                await this.updateToken(30);
            }
            return this.keycloak.token;
        } else {
            return '';
        }
    };

    public static getRefreshToken = () => this.keycloak.refreshToken || '';

    public static isLoggedIn = () => !!this.keycloak.token;

    public static getUsername = () => this.keycloak.tokenParsed?.preferred_username;

    public static getUserInfo = () => this.keycloak.loadUserInfo();

    public static getUserProfile = () => this.keycloak.loadUserProfile();

    public static getParsedToken = () => this.keycloak.tokenParsed;
}

export default KeycloakService;
