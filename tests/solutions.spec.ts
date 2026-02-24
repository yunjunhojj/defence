import { test, expect } from '@playwright/test';
import { curriculum } from '../src/data/curriculum';

test.describe('Problem Solutions Verification', () => {
    for (const stage of curriculum) {
        for (const problem of stage.problems) {
            test(`Stage: ${stage.title} - Problem: ${problem.title}`, async ({ page }) => {
                // Listen to console and errors
                page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
                page.on('pageerror', exception => console.log(`[Browser Error] ${exception}`));

                await page.goto('/');

                // 1. Locate the problem button in the sidebar and click it
                const problemButton = page.locator('button', { hasText: problem.title });
                await problemButton.click();

                // Wait for iframe to load or React to render
                await page.waitForTimeout(500);

                // 2. Set the code directly into the Zustand store
                await page.evaluate((code) => {
                    // @ts-ignore
                    if (window.__GAME_STORE__) {
                        // @ts-ignore
                        window.__GAME_STORE__.getState().setCode(`export default function getPayload() {\n  ${code}\n}`);
                    }
                }, problem.solutionCode);

                // Wait a tiny bit for React state to sync
                await page.waitForTimeout(200);

                // 3. Click "Execute Payload"
                const executeButton = page.getByRole('button', { name: 'Execute Payload' });
                await executeButton.click();

                // 4. Assert that the problem has the complete checkmark
                const checkmark = problemButton.locator('.text-emerald-500');

                // Increase timeout significantly to allow IFRAME execution
                await expect(checkmark).toBeVisible({ timeout: 10000 });
            });
        }
    }
});
