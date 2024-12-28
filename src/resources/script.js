

const resizableElement = document.getElementById("resizable-element");

// Load last saved device layout on page load
window.onload = () => {
  const savedLayout = localStorage.getItem("deviceLayout");
  if (savedLayout) {
    const { width, height, label } = JSON.parse(savedLayout);
    applyLayout(width, height, label);
  } else {
    // Default to Phone View
    resizeToPhone();
  }
};

function applyLayout(width, height, label) {
  resizableElement.style.width = width;
  resizableElement.style.height = height;
  resizableElement.innerText = label;
  resizableElement.innerHTML = "";
}

function saveLayout(width, height, label) {
  localStorage.setItem("deviceLayout", JSON.stringify({ width, height, label }));
}

function resizeToPhone() {
  const width = "50%";
  const height = "110%";
  const label = "Phone View ";
  applyLayout(width, height, label);
  saveLayout(width, height, label);
}

function resizeToLaptop() {
  const width = "99%";
  const height = "98%";
  const label = "Laptop View ";
  applyLayout(width, height, label);
  saveLayout(width, height, label);
}

//method to make sure palette size is perfect
function toggleContent(element) {
  var content = element.nextElementSibling;
  content.style.display = content.style.display === "block" ? "none" : "block";
}
