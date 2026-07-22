import { expect, test } from "@playwright/test";

test("adds and edits a field", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Untitled form",
    }),
  ).toBeVisible();

  await expect(page.getByText("0/50 fields")).toBeVisible();

  await page.getByRole("button", {
    name: "Add field",
  }).click();

  await page.keyboard.press("Enter");

  await expect(page.getByText("1/50 fields")).toBeVisible();

  const fieldLabel = page.getByRole("textbox", {
    name: "Field 1 label",
  });

  await expect(fieldLabel).toHaveValue("Untitled Question");

  await fieldLabel.fill("Email address");
  await fieldLabel.press("Enter");

  await expect(fieldLabel).toHaveValue("Email address");
  await expect(
    page.getByLabel("Email address preview"),
  ).toBeVisible();
});