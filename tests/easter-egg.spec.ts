import { test, expect } from '@playwright/test';
import { curriculum } from '../src/data/curriculum';

test.describe('Easter Egg Verification', () => {
    test(`Logo 5-Click Answer Reveal`, async ({ page }) => {
        // Listen to console and errors for easier debugging
        page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', exception => console.log(`[Browser Error] ${exception}`));

        await page.goto('/');

        // Get the first stage and first problem
        const firstStage = curriculum[0];
        const firstProblem = firstStage.problems[0];

        // 1. Locate the problem button in the sidebar and click it
        const problemButton = page.locator('button', { hasText: firstProblem.title });
        await problemButton.click();

        // Wait to load state
        await page.waitForTimeout(500);

        // 2. Click the specific logo element 5 times fast
        const logo = page.locator('text=Web Defense Academy').first();
        for (let i = 0; i < 5; i++) {
            await logo.click({ clickCount: 1, delay: 50 });
        }

        // Wait for AnswerSheetModal to appear
        const answerSheetModal = page.locator('text=' + firstStage.title + ' Solution').first();
        await expect(answerSheetModal).toBeVisible({ timeout: 5000 });

        // 3. Extract payload from the modal
        const payloadSnippetLocators = page.locator('.text-amber-300');
        await expect(payloadSnippetLocators).toBeVisible();

        let answerText = await payloadSnippetLocators.textContent() || '';
        answerText = answerText.trim();
        expect(answerText).toBeTruthy();
        console.log("EXTRACTED PAYLOAD: ", answerText);

        // 4. Close the modal
        const closeButton = page.locator('button:has(.lucide-x)').first();
        await closeButton.click();

        // Ensure Modal is closed
        await expect(answerSheetModal).toBeHidden();
        await page.waitForTimeout(500); // give time for react to render

        // 5. Inject the code into the Editor directly via Game Store
        console.log("Injecting payload into state...");
        const fullCode = `export default function getPayload() {\n  ${answerText}\n}`;
        await page.evaluate((code) => {
            // @ts-ignore
            if (window.__GAME_STORE__) {
                console.log("Store found! injecting...");
                // @ts-ignore
                window.__GAME_STORE__.getState().setCode(code);
            }
        }, fullCode);

        await page.waitForTimeout(500);

        // 6. Execute Payload and assert checkmark
        console.log("Clicking execute...");
        const executeButton = page.getByRole('button', { name: 'Execute Payload' });
        await executeButton.click();

        console.log("Waiting for checkmark...");
        // Problem button in sidebar should have .text-emerald-500 applied
        const checkmark = problemButton.locator('.text-emerald-500');
        await expect(checkmark).toBeVisible({ timeout: 10000 });

        console.log("Successfully extracted payload and passed logic checks.");
    });
});
