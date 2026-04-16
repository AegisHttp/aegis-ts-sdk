"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../src/index");
describe('AegisHttpSDK', () => {
    let aegis;
    beforeEach(() => {
        // Reset DOM
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        // Ensure aegis is loaded on window
        aegis = window.aegis;
        // Reset fetch mock
        global.fetch = jest.fn();
    });
    describe('init()', () => {
        it('should ensure gpg-auto meta tag exists on init', () => {
            aegis.init();
            const autoMeta = document.querySelector('meta[name="gpg-auto"]');
            expect(autoMeta).toBeTruthy();
            expect(autoMeta?.getAttribute('content')).toBe('true');
        });
        it('should add gpg-tunnel meta tag when forceTunneling is true', () => {
            aegis.init({ forceTunneling: true });
            const tunnelMeta = document.querySelector('meta[name="gpg-tunnel"]');
            expect(tunnelMeta).toBeTruthy();
            expect(tunnelMeta?.getAttribute('content')).toBe('true');
        });
        it('should NOT add gpg-tunnel meta tag when forceTunneling is false', () => {
            aegis.init({ forceTunneling: false });
            const tunnelMeta = document.querySelector('meta[name="gpg-tunnel"]');
            expect(tunnelMeta).toBeFalsy();
        });
    });
    describe('login()', () => {
        it('should trigger install dialog and throw if gpgLogin is absent', async () => {
            window.gpgLogin = undefined;
            await expect(aegis.login()).rejects.toThrow(/GPG Browser Extension is not installed or active/);
            // Check if DOM has the overlay appended
            const title = Array.from(document.querySelectorAll('h2')).find(el => el.innerText.includes('Aegis Http Extension Required'));
            expect(title).toBeTruthy();
        });
        it('should successfully execute the login handshake', async () => {
            // Mock native extension function
            window.gpgLogin = jest.fn().mockResolvedValue({
                email: 'test@example.com',
                signature: 'mock_sig',
                public_key: 'mock_pk'
            });
            // Mock fetch calls for Challenge and Login Verification
            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/challenge')) {
                    return Promise.resolve({
                        ok: true,
                        headers: new Map([['x-gpg-support', 'true']]),
                        json: () => Promise.resolve({ challenge: 'test_challenge_123' })
                    });
                }
                if (url.includes('/api/login')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ email: 'test@example.com', status: 'verified' })
                    });
                }
                return Promise.resolve({ ok: true });
            });
            const email = await aegis.login();
            expect(email).toBe('test@example.com');
            expect(window.gpgLogin).toHaveBeenCalledWith('test_challenge_123');
            expect(global.fetch).toHaveBeenCalledTimes(3); // Challenge -> Login POST -> Empty Registration GET
        });
        it('should fail if server lacks GPG support header', async () => {
            window.gpgLogin = jest.fn();
            global.fetch.mockResolvedValueOnce({
                ok: true,
                headers: new Map(), // No x-gpg-support header!
            });
            await expect(aegis.login()).rejects.toThrow(/x-gpg-support header missing/);
        });
    });
});
//# sourceMappingURL=index.test.js.map