"""
Browser end-to-end test (Selenium + headless Firefox) for the whole product.

Prerequisites: API + client running with the demo data loaded (`npm run seed` in wedplan-server) and Stripe NOT
required. The test signs up a vendor, uploads an image, books services, approves/blocks as admin, etc.

    pip install selenium
    WEDPLAN_URL=http://localhost:3000 python e2e/ui_test.py
Optional: FIREFOX_BIN, GECKODRIVER, SHOTS_DIR (screenshots).
"""
import time, sys, os, base64, struct, zlib
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import tempfile
W = os.environ.get("WEDPLAN_URL", "http://localhost:3000")
SHOTS = os.environ.get("SHOTS_DIR", os.path.join(tempfile.gettempdir(), "wedplan-shots"))
os.makedirs(SHOTS, exist_ok=True)
o = Options(); o.add_argument("-headless")
if os.environ.get("FIREFOX_BIN"): o.binary_location = os.environ["FIREFOX_BIN"]
gd = os.environ.get("GECKODRIVER")
d = webdriver.Firefox(options=o, service=Service(gd, log_output=os.path.join(tempfile.gettempdir(), "gecko.log")) if gd else Service(log_output=os.path.join(tempfile.gettempdir(), "gecko.log")))
d.set_window_size(1366, 900)
wait = lambda t=15: WebDriverWait(d, t)
res = []
def check(name, cond, extra=""):
    res.append(bool(cond)); print(("PASS  " if cond else "FAIL  ") + name + (f"  [{extra}]" if (extra and not cond) else ""))
def shot(n): d.save_screenshot(os.path.join(SHOTS, f"{n}.png"))
def text(): return d.find_element(By.TAG_NAME, "body").text
def wait_text(s, t=15):
    try: wait(t).until(lambda x: s.lower() in text().lower()); return True
    except Exception: return False
def wait_url(s, t=15):
    try: wait(t).until(EC.url_contains(s)); return True
    except Exception: return False
def login(email, pw):
    d.get(W + "/signin"); wait().until(EC.presence_of_element_located((By.ID, "email")))
    d.find_element(By.ID, "email").send_keys(email); d.find_element(By.ID, "password").send_keys(pw)
    d.find_element(By.CSS_SELECTOR, "form button[type=submit]").click()
def logout():
    d.find_element(By.CSS_SELECTOR, "[aria-label='Account menu']").click()
    wait().until(EC.element_to_be_clickable((By.XPATH, "//*[@role='menuitem'][contains(.,'Log out')]"))).click()
    wait_text("Get started")

try:
    # ---- public pages
    d.get(W); check("home renders hero", wait_text("Plan the wedding")); time.sleep(1.5); shot("01_home")
    for y in range(0, 4000, 500): d.execute_script(f"window.scrollTo(0,{y})"); time.sleep(0.25)
    check("home shows featured services", wait_text("Featured services") and wait_text("Lakeside Garden Banquet Hall", 20)); shot("01b_home_scrolled")
    d.execute_script("window.scrollTo(0,0)")
    d.get(W + "/services"); check("browse lists services", wait_text("services found", 20)); shot("02_browse")
    d.find_element(By.CSS_SELECTOR, "input[aria-label='Search services']").send_keys("floral")
    time.sleep(1.6); check("search filters results (URL updated)", "q=floral" in d.current_url and wait_text("Floral Stage"))
    d.get(W + "/services?category=Wedding%20Venues&sort=price_desc"); wait_text("services found")
    prices = [int(x.replace("$","").replace(",","")) for x in __import__("re").findall(r"\$[\d,]+", text()) ]
    check("category + sort price desc works", wait_text("Royal Grand Ballroom") and prices[:2] == sorted(prices[:2], reverse=True), str(prices[:4]))

    # ---- auth guard
    d.get(W + "/dashboard/vendor"); check("guard: signed-out dashboard -> /signin?redirect", wait_url("/signin?redirect=") )
    # ---- signup validation + real signup
    d.get(W + "/signup?role=vendor"); wait().until(EC.presence_of_element_located((By.ID, "name")))
    d.find_element(By.CSS_SELECTOR, "form button[type=submit]").click(); time.sleep(0.5)
    check("signup shows validation errors", "Please enter your full name" in text() and "valid email" in text())
    shot("03_signup_errors")
    d.find_element(By.ID, "name").send_keys("Test Vendor"); d.find_element(By.ID, "biz").send_keys("Test Vendor Studio")
    d.find_element(By.ID, "email").send_keys("ui.vendor@example.com"); d.find_element(By.ID, "password").send_keys("weakpass")
    d.find_element(By.CSS_SELECTOR, "form button[type=submit]").click(); time.sleep(0.6)
    check("weak password rejected client-side", "does not meet" in text())
    pw = d.find_element(By.ID, "password"); pw.clear(); pw.send_keys("Strong1pass")
    d.find_element(By.CSS_SELECTOR, "form button[type=submit]").click()
    check("vendor signup -> vendor dashboard", wait_url("/dashboard/vendor") and wait_text("Vendor dashboard", 20)); shot("04_vendor_dash_new")
    check("navbar shows account menu after signup", len(d.find_elements(By.CSS_SELECTOR, "[aria-label='Account menu']")) == 1)

    # ---- vendor adds a service (image upload through real file input)
    d.get(W + "/dashboard/vendor/services/new"); wait().until(EC.presence_of_element_located((By.ID, "sn")))
    def png(path):
        raw = b"".join(b"\x00" + b"\xff\x80\x90" * 8 for _ in range(8))
        c = lambda t, b: struct.pack(">I", len(b)) + t + b + struct.pack(">I", zlib.crc32(t + b) & 0xffffffff)
        open(path, "wb").write(b"\x89PNG\r\n\x1a\n" + c(b"IHDR", struct.pack(">IIBBBBB", 8, 8, 8, 2, 0, 0, 0)) + c(b"IDAT", zlib.compress(raw)) + c(b"IEND", b""))
    png(os.path.join(tempfile.gettempdir(), "ui_test.png"))
    d.find_element(By.CSS_SELECTOR, "input[type=file]").send_keys(os.path.join(tempfile.gettempdir(), "ui_test.png"))
    check("image uploaded & previewed", wait(20).until(lambda x: len(x.find_elements(By.CSS_SELECTOR, "img[alt='Upload 1']")) == 1))
    d.find_element(By.ID, "sn").send_keys("UI Test Cake Design")
    d.find_element(By.CSS_SELECTOR, "button[aria-label='Category']").click()
    wait().until(EC.element_to_be_clickable((By.XPATH, "//*[@role='option'][contains(.,'Catering Services')]"))).click()
    d.find_element(By.ID, "price").send_keys("450"); d.find_element(By.ID, "loc").send_keys("Dhaka")
    d.find_element(By.ID, "desc").send_keys("Custom multi-tier wedding cakes baked fresh with your choice of flavours.")
    shot("05_service_form")
    d.find_element(By.CSS_SELECTOR, "form button[type=submit]").click()
    check("service created -> list shows Pending", wait_url("/dashboard/vendor/services") and wait_text("UI Test Cake Design", 15) and "Pending" in text()); shot("06_vendor_services")
    # Free-plan cap: add 2 more via API-free UI is long; verified by API tests.

    # ---- profile update
    d.get(W + "/dashboard/profile"); wait().until(EC.presence_of_element_located((By.ID, "phone")))
    d.find_element(By.ID, "phone").send_keys("+8801999999999"); d.find_element(By.CSS_SELECTOR, "form button[type=submit]").click()
    check("profile saved toast", wait_text("Profile updated successfully")); shot("07_profile")
    logout(); check("logout returns to guest navbar", "Get started" in text())

    # ---- customer flow: login, book, view bookings, cancel
    login("tanvir@example.com", "Demo1234")
    check("customer login -> customer dashboard", wait_url("/dashboard/customer") and wait_text("Total requests", 20)); shot("08_customer_dash")
    d.get(W + "/services"); wait_text("services found")
    d.find_element(By.XPATH, "//h3[contains(.,'Royal Grand Ballroom')]").click()
    check("service details page", wait_text("Request booking", 20)); shot("09_details")
    d.find_element(By.XPATH, "//button[contains(.,'Request booking')]").click()
    wait().until(EC.presence_of_element_located((By.ID, "date")))
    d.find_element(By.ID, "date").send_keys("12-31-2030" if False else "2030-12-31")
    d.find_element(By.ID, "loc").send_keys("Chittagong Club"); d.find_element(By.ID, "msg").send_keys("Reception for 400 guests please")
    d.find_element(By.XPATH, "//button[contains(.,'Send request')]").click()
    check("booking request success toast", wait_text("Booking request sent")); shot("10_booking_sent")
    d.find_element(By.XPATH, "//button[contains(.,'Request booking')]").click(); wait().until(EC.presence_of_element_located((By.ID, "date")))
    d.find_element(By.ID, "date").send_keys("2030-12-31"); d.find_element(By.ID, "loc").send_keys("Chittagong Club"); d.find_element(By.ID, "msg").send_keys("Duplicate try")
    d.find_element(By.XPATH, "//button[contains(.,'Send request')]").click()
    check("duplicate booking shows error toast", wait_text("already have an active booking"))
    d.get(W + "/dashboard/customer/bookings"); check("my bookings lists new request", wait_text("Royal Grand Ballroom", 15)); shot("11_customer_bookings")
    cancel = d.find_elements(By.XPATH, "//button[normalize-space()='Cancel']")
    cancel[0].click(); wait().until(EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Cancel request')]"))).click()
    check("customer cancels a pending request", wait_text("Booking request cancelled"))
    d.get(W + "/dashboard/vendor"); check("customer cannot open vendor dashboard (redirected to own)", wait_url("/dashboard/customer"))
    logout()

    # ---- vendor accepts
    login("rahim@royalvenues.bd", "Demo1234"); wait_url("/dashboard/vendor")
    d.get(W + "/dashboard/vendor/bookings"); wait_text("Booking requests")
    check("vendor sees requests", wait_text("Claire Bennett", 15)); shot("12_vendor_bookings")
    d.get(W + "/dashboard/vendor/subscription"); check("premium plan card shows Active", wait_text("Active — renews", 15)); shot("13_subscription")
    d.get(W + "/dashboard/vendor/services"); wait_text("My services"); shot("13b_premium_services")
    logout()

    # ---- admin
    login("admin@wedplan.com", "Adm1nStrongPass"); check("admin login -> admin dashboard", wait_url("/dashboard/admin") and wait_text("Admin overview", 20)); shot("14_admin")
    d.get(W + "/dashboard/admin/services?status=Pending"); check("admin sees pending service", wait_text("UI Test Cake Design", 15)); shot("15_admin_services")
    d.find_element(By.XPATH, "//tr[contains(.,'UI Test Cake Design')]//button[@aria-label='Approve']").click()
    check("admin approves service", wait_text("Service approved"))
    d.get(W + "/dashboard/admin/users"); wait_text("Manage users"); shot("16_admin_users")
    d.find_element(By.XPATH, "//tr[contains(.,'mim@example.com')]//button[contains(.,'Block')]").click()
    wait().until(EC.element_to_be_clickable((By.XPATH, "//div[@role='dialog']//button[contains(.,'Block user')]"))).click()
    check("admin blocks a user", wait_text("User blocked"))
    d.get(W + "/dashboard/admin/transactions"); check("transactions page read-only table", wait_text("Stripe reference", 15) and "block" not in text().lower().replace("blocked","")); shot("17_admin_tx")
    logout()

    # ---- blocked user cannot sign in
    login("mim@example.com", "Demo1234"); time.sleep(2.5)
    check("blocked user cannot sign in", "/signin" in d.current_url and ("blocked" in text().lower())); shot("18_blocked")

    # ---- mobile
    d.set_window_size(390, 844); d.get(W); time.sleep(2)
    check("mobile menu button visible", len(d.find_elements(By.CSS_SELECTOR, "button[aria-label='Toggle menu']")) == 1); shot("19_mobile_home")
    d.find_element(By.CSS_SELECTOR, "button[aria-label='Toggle menu']").click(); time.sleep(0.5); shot("20_mobile_menu")
    d.get(W + "/services"); wait_text("services found"); shot("21_mobile_browse")
    overflow = d.execute_script("return document.documentElement.scrollWidth - document.documentElement.clientWidth")
    check("no horizontal overflow on mobile", overflow <= 1, str(overflow))
finally:
    d.quit()
    print(f"\nUI RESULT: {sum(res)}/{len(res)} passed")
