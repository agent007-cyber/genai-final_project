document.getElementById('resumeForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Collect form data
  const name = document.getElementById('name').value.trim();
  const education = document.getElementById('education').value.trim();
  const experience = document.getElementById('experience').value.trim();
  const role = document.getElementById('role').value.trim();

  // Error containers
  const nameError = document.getElementById('name-error');
  const educationError = document.getElementById('education-error');
  const experienceError = document.getElementById('experience-error');
  const roleError = document.getElementById('role-error');
  const outputDiv = document.getElementById('output');

  
  nameError.textContent = '';
  educationError.textContent = '';
  experienceError.textContent = '';
  roleError.textContent = '';
  outputDiv.style.display = 'none';
  outputDiv.innerHTML = '';

  
  let emptyFields = 0;
  if (!name) {
    emptyFields++;
    nameError.textContent = "Please enter your full name.";
  }
  if (!education) {
    emptyFields++;
    educationError.textContent = "Please enter your education.";
  }
  if (!experience) {
    emptyFields++;
    experienceError.textContent = "Please enter your work experience.";
  }
  if (!role) {
    emptyFields++;
    roleError.textContent = "Please enter your target job role.";
  }

  
  if (emptyFields === 4) {
    outputDiv.innerHTML = "<span style='color:red;'>Please fill in all fields.</span>";
    outputDiv.style.display = 'block';
    return;
  }

  
  if (emptyFields > 0) {
    return;
  }

  // All fields filled, call backend API
  outputDiv.innerHTML = "Generating resume and cover letter...";
  outputDiv.style.display = 'block';

  try {
    const response = await fetch('http://localhost:3000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, education, experience, role })
    });

    const data = await response.json();

    if (data.result) {
      // Formatting data
      const formatted = data.result.replace(/\n/g, '<br>');
      outputDiv.innerHTML = `<h3>AI-Generated Resume & Cover Letter</h3>
      <div style="white-space:pre-wrap;">${formatted}</div>
      <button id="downloadPDF">Download as PDF</button>`;
      document.getElementById('downloadPDF').onclick = function() {
        downloadPDF({ name, education, experience, role });
      };

    } else if (data.error) {
      outputDiv.innerHTML = `<span style="color:red;">${data.error}</span>`;
    } else {
      outputDiv.innerHTML = "<span style='color:red;'>Unexpected response from server.</span>";
    }
  } catch (err) {
    outputDiv.innerHTML = "<span style='color:red;'>Generate your API key first.</span>";
  }
});

// PDF download function
async function downloadPDF(data) {
  try {
    const response = await fetch('http://localhost:3000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, format: "pdf" })
    });
    if (!response.ok) throw new Error("PDF generation failed.");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "resume_cover_letter.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("Failed to download PDF.");
  }
}
