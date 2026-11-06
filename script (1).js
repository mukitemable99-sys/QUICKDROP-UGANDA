const WHATSAPP_NUMBER = "256763618911";
const BUSINESS_EMAIL = "epaphrasnowamani@gmail.com";
const EMAIL_ENDPOINT = `https://formsubmit.co/ajax/${BUSINESS_EMAIL}`;

document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector(".year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      toggle.textContent = isOpen ? "✕" : "☰";
    });
  }

  // Send one copy to the business email through FormSubmit and open WhatsApp
  // with the same enquiry. The visitor must press Send in WhatsApp.
  async function sendEmailCopy(fields, subject) {
    const payload = {
      ...fields,
      _subject: subject,
      _template: "table",
      _captcha: "false"
    };

    const response = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || result.success === "false") {
      throw new Error(result.message || "Email delivery could not be confirmed.");
    }
    return result;
  }

  function openWhatsApp(message) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  }

  const orderForm = document.querySelector("#orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!orderForm.reportValidity()) return;

      const button = orderForm.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Sending request...";

      const data = new FormData(orderForm);
      const fields = {
        "Customer name": data.get("name"),
        "Customer phone": data.get("phone"),
        "Delivery type": data.get("service"),
        "Pickup location": data.get("pickup"),
        "Delivery destination": data.get("destination"),
        "Item / additional details": data.get("details") || "Not provided"
      };

      const whatsappMessage = [
        "Hello QuickDrop, I would like to place a delivery order.",
        ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`)
      ].join("\n");

      // Open WhatsApp immediately to avoid popup blocking, then email the same details.
      openWhatsApp(whatsappMessage);

      try {
        await sendEmailCopy(fields, "New QuickDrop delivery order");
        alert("Your order details have been sent to QuickDrop's email. WhatsApp has also been opened; press Send there to send the WhatsApp copy.");
        orderForm.reset();
      } catch (error) {
        alert("WhatsApp has been opened. The email copy could not be confirmed. Please try again or contact QuickDrop directly by email.");
        console.error(error);
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  const contactForm = document.querySelector("#contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const button = contactForm.querySelector('button[type="submit"]');
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Sending enquiry...";

      const name = document.querySelector("#contactName").value.trim();
      const sender = document.querySelector("#contactEmail").value.trim();
      const subject = document.querySelector("#contactSubject").value.trim();
      const message = document.querySelector("#contactMessage").value.trim();

      const fields = {
        "Customer name": name,
        "Customer email": sender,
        "Subject": subject,
        "Message": message
      };

      const whatsappMessage = [
        "Hello QuickDrop, I have a website enquiry.",
        `Name: ${name}`,
        `Email: ${sender}`,
        `Subject: ${subject}`,
        `Message: ${message}`
      ].join("\n");

      openWhatsApp(whatsappMessage);

      try {
        await sendEmailCopy(fields, `QuickDrop enquiry: ${subject}`);
        alert("Your enquiry has been sent to QuickDrop's email. WhatsApp has also been opened; press Send there to send the WhatsApp copy.");
        contactForm.reset();
      } catch (error) {
        alert("WhatsApp has been opened. The email copy could not be confirmed. Please try again or contact QuickDrop directly by email.");
        console.error(error);
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  const trackButton = document.querySelector("#trackButton");
  if (trackButton) {
    trackButton.addEventListener("click", () => {
      const code = document.querySelector("#trackingCode").value.trim();
      const messageBox = document.querySelector("#trackingMessage");
      if (!code) {
        messageBox.textContent = "Please enter your order reference first.";
        return;
      }

      const message = `Hello QuickDrop, please help me check the status of order reference: ${code}`;
      openWhatsApp(message);
      // Tracking enquiry also sends an email copy.
      sendEmailCopy(
        { "Order reference": code, "Enquiry": "Please provide an update on this delivery." },
        "QuickDrop order tracking enquiry"
      ).then(() => {
        messageBox.textContent = "The tracking enquiry was sent to the business email. WhatsApp has opened too; press Send there to send the WhatsApp copy.";
      }).catch(error => {
        messageBox.textContent = "WhatsApp has opened. The email copy could not be confirmed; please contact QuickDrop directly if needed.";
        console.error(error);
      });
    });
  }
});
