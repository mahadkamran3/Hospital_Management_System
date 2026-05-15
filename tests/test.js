import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const loginUrl = `${frontendUrl}/login`;
const backendApi = process.env.BACKEND_URL || 'http://localhost:5000';
const sampleEmail = 'mahadkamran47@gmail.com';
const samplePassword = 'mahadkamran123';

const buildDriver = () => {
  const options = new chrome.Options();
  // Uncomment to run headless
  options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
};

const openUserMenu = async (driver) => {
  try {
    const menuButton = await driver.wait(
      until.elementLocated(By.css('button[aria-haspopup="true"]')),
      10000
    );
    await menuButton.click();
  } catch {
    const fallbackButton = await driver.wait(
      until.elementLocated(By.xpath("//button[.//div[contains(@class,'MuiAvatar-root')]]")),
      10000
    );
    await fallbackButton.click();
  }
};

/**
 * Select a MUI v5 non-native <Select> option by label text and zero-based index.
 * Clicks the trigger via executeScript (bypasses interactability check), then
 * clicks the option in the portal popup via executeScript.
 */
const selectMuiOption = async (driver, labelText, optionIndex = 0) => {
  // Try multiple strategies to locate the MUI select trigger
  let trigger;
  const xpaths = [
    `//div[label[normalize-space()='${labelText}']]//div[contains(@class,'MuiSelect-root')]`,
    `//label[normalize-space()='${labelText}']/following::div[contains(@class,'MuiSelect-root') or @role='combobox' or @role='button'][1]`,
    `//label[normalize-space()='${labelText}']/following::div[@role='listbox' or @role='combobox' or @role='button'][1]`
  ];
  for (const xp of xpaths) {
    try {
      trigger = await driver.findElement(By.xpath(xp));
      console.log('DEBUG: selectMuiOption found trigger using xpath:', xp);
      break;
    } catch (e) {
      // continue to next xpath
    }
  }
  if (!trigger) {
    throw new Error(`Could not find select trigger for label "${labelText}"`);
  }
  await driver.executeScript('arguments[0].click();', trigger);
  await driver.sleep(500);
  const text = await driver.executeScript((idx) => {
    const listbox = document.querySelector('[role="listbox"]');
    if (listbox) {
      const opts = listbox.querySelectorAll('[role="option"], li');
      if (opts.length > idx) { opts[idx].click(); return opts[idx].textContent.trim(); }
    }
    const menu = document.querySelector('[role="menu"]');
    if (menu) {
      const opts = menu.querySelectorAll('li');
      if (opts.length > idx) { opts[idx].click(); return opts[idx].textContent.trim(); }
    }
    return null;
  }, optionIndex);
  if (!text) throw new Error(`Could not select option ${optionIndex} in "${labelText}" select.`);
  console.log(`DEBUG: Selected "${labelText}": ${text}`);
  await driver.sleep(300);
  return text;
};

const runTests = async () => {
  const driver = buildDriver();

  try {
    console.log('Running empty-login validation test...');
    await driver.get(loginUrl);
    await driver.wait(until.elementLocated(By.name('email')), 10000);
    await driver.findElement(By.xpath("//button[normalize-space()='Sign In']")).click();

    const errorElement = await driver.wait(
      until.elementLocated(By.xpath("//div[contains(@class,'MuiAlert-root') or contains(@class,'MuiAlert-message')][contains(normalize-space(.), 'Please fill in all fields')] | //p[contains(normalize-space(), 'Please fill in all fields')] | //span[contains(normalize-space(), 'Please fill in all fields')]") ),
      10000
    );
    console.log('✔ Empty-login validation works:', await errorElement.getText());

    console.log('Running valid-login navigation test...');
    await driver.findElement(By.name('email')).sendKeys(sampleEmail);
    await driver.findElement(By.name('password')).sendKeys(samplePassword);
    await driver.findElement(By.xpath("//button[normalize-space()='Sign In']")).click();

    await driver.wait(until.urlContains('/appointments'), 15000);
    await driver.wait(until.elementLocated(By.xpath("//*[normalize-space()='Appointments']")), 15000);
    console.log('✔ Login succeeded and appointments page loaded.');

    console.log('Running appointment creation test (API-backed)...');

    // Create appointment via API using the logged-in user's token; omit `time` so server assigns one
    const patientName = 'Selenium Test User';
    const today = new Date().toISOString().split('T')[0];

    // Read token from browser localStorage
    const token = await driver.executeScript("return localStorage.getItem('token');");
    if (!token) throw new Error('No auth token found in browser localStorage');

    const apiUrl = `${backendApi}/api/appointments`;
    const payload = { patientName, doctorName: 'Dr. Sana Malik', date: today, department: 'General Medicine', phone: '0300-1234567' };

    // Use fetch (Node 18+) to call backend API
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const apiJson = await apiRes.json();
    console.log('DEBUG: API create response:', apiJson);

    // Refresh the appointments page so the new appointment is visible in UI
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.xpath("//*[normalize-space()='Appointments']")), 10000);

    // Give frontend time to fetch updated appointments
    await driver.sleep(2000);
    const rowsBefore = await driver.executeScript(`
      return Array.from(document.querySelectorAll('table tbody tr')).map(r => r.textContent.trim());
    `);
    console.log('DEBUG: Table rows after refresh:', rowsBefore);

    console.log('DEBUG: Waiting for appointment in table with name:', patientName);
    await driver.wait(
      until.elementLocated(By.xpath(`//td[contains(normalize-space(.), '${patientName}')]`)),
      15000
    );
    console.log('✔ Appointment creation succeeded (via API).');

    console.log('Running logout test...');
    await openUserMenu(driver);
    const logoutButton = await driver.wait(
      until.elementLocated(By.xpath("//li[normalize-space()='Logout' or .//span[normalize-space()='Logout']] | //button[normalize-space()='Logout']")),
      10000
    );
    await logoutButton.click();

    await driver.wait(until.urlContains('/login'), 10000);
    console.log('✔ Logout returned to login screen.');
    console.log('\nAll Selenium tests completed successfully.');
  } catch (error) {
    console.error('\nE2E test failed:', error);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
};

runTests();
