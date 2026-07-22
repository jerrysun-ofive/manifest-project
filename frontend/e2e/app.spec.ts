import { expect, test, type Page } from "@playwright/test";

async function insertField(
  page: Page,
  search: string,
  expectedOption: string,
) {
  await page
    .getByRole("button", {
      name: "Add field",
      exact: true,
    })
    .first()
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Insert a field",
  });
  await dialog
    .getByRole("textbox", {
      name: "Search field types",
    })
    .fill(search);
  const option = dialog.getByRole("option", {
    name: new RegExp(expectedOption, "i"),
  });
  await expect(option).toBeVisible();
  await option.click();
  await expect(dialog).not.toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Untitled form",
    }),
  ).toBeVisible();
});

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

test("finds a number field using the age keyword", async ({
  page,
}) => {
  await insertField(page, "age", "Number");
  await expect(page.getByText("1/50 fields")).toBeVisible();
  await expect(
    page.getByRole("spinbutton", {
      name: "Untitled Question preview",
    }),
  ).toBeVisible();
});

test("validates a required field in test mode", async ({
  page,
}) => {
  await insertField(page, "short text", "Short text");
  const label = page.getByRole("textbox", {
    name: "Field 1 label",
  });
  await label.fill("Email address");
  await label.press("Enter");
  await page.getByRole("button", {
    name: "Optional",
  }).click();
  await page.getByRole("button", {
    name: "Test form",
  }).click();
  const emailInput = page.getByRole("textbox", {
    name: /Email address/,
  });
  await page.getByRole("button", {
    name: "Check response",
  }).click();
  await expect(emailInput).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(
    page.getByText("This field is required"),
  ).toBeVisible();
  await emailInput.fill("person@example.com");
  await page.getByRole("button", {
    name: "Check response",
  }).click();
  await expect(page.getByRole("status")).toHaveText(
    "All answers are valid.",
  );
});

test("moves a field above another field", async ({ page }) => {
  await insertField(page, "short text", "Short text");
  const firstLabel = page.getByRole("textbox", {
    name: "Field 1 label",
  });
  await firstLabel.fill("First question");
  await firstLabel.press("Enter");
  await insertField(page, "long text", "Long text");
  const secondLabel = page.getByRole("textbox", {
    name: "Field 2 label",
  });
  await secondLabel.fill("Second question");
  await secondLabel.press("Enter");
  await page.getByRole("button", {
    name: "Move field up",
  }).click();
  const labels = page
    .getByRole("list", {
      name: "Form fields",
    })
    .getByRole("textbox", {
      name: /Field \d+ label/,
    });
  await expect(labels.nth(0)).toHaveValue(
    "Second question",
  );
  await expect(labels.nth(1)).toHaveValue(
    "First question",
  );
});