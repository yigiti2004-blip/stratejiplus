import React from 'react';

export const showToast = (message, options = {}) => {
  const defaultOptions = {
    background: "#ffffff",
    color: "#111",
    duration: 3000,
    position: "bottom-right",
    ...options
  };

  // If using Sonner (check global existence)
  if (typeof window !== 'undefined' && window.toast && typeof window.toast.custom === 'function') {
    window.toast.custom((t) => (
      React.createElement('div', {
        style: {
          background: defaultOptions.background,
          color: defaultOptions.color,
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 99999,
          opacity: 1,
          border: "1px solid #e5e7eb"
        }
      }, message)
    ), {
      duration: defaultOptions.duration,
      position: defaultOptions.position
    });
  }
  // If using React-Toastify
  else if (typeof window !== 'undefined' && window.Toast && typeof window.Toast.show === 'function') {
    window.Toast.show({
      type: options.type || "success",
      text1: message,
      text1Style: {
        color: defaultOptions.color,
        fontSize: 14,
        fontWeight: "500"
      },
      style: {
        background: defaultOptions.background,
        opacity: 1,
        zIndex: 99999
      }
    });
  }
  // Fallback: Custom toast
  else {
    createCustomToast(message, defaultOptions);
  }
};

export const showSuccessToast = (message) => {
  showToast(message, {
    background: "#ffffff",
    color: "#111",
    type: "success",
    // Adding a subtle green border for visual cue
    style: "border-left: 4px solid #10b981;" 
  });
};

export const showErrorToast = (message) => {
  showToast(message, {
    background: "#e53935",
    color: "#ffffff",
    type: "error"
  });
};

export const showWarningToast = (message) => {
  showToast(message, {
    background: "#fff3cd",
    color: "#111",
    type: "warning",
    style: "border-left: 4px solid #f59e0b;"
  });
};

export const showInfoToast = (message) => {
  showToast(message, {
    background: "#d1ecf1",
    color: "#111",
    type: "info",
    style: "border-left: 4px solid #3b82f6;"
  });
};

// Fallback custom toast implementation
const createCustomToast = (message, options) => {
  const toastContainer = document.getElementById("toast-container") || createToastContainer();
  
  const toastElement = document.createElement("div");
  toastElement.className = "custom-toast";
  
  // Combine base styles with options
  toastElement.style.cssText = `
    background: ${options.background} !important;
    color: ${options.color} !important;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    opacity: 1 !important;
    z-index: 99999 !important;
    border: 1px solid #e5e7eb;
    min-width: 300px;
    display: flex;
    align-items: center;
    animation: slideIn 0.3s ease-out;
    ${options.style || ''}
  `;
  
  // Add icon based on type (simple ascii or empty for now to match request style)
  let prefix = "";
  if (options.type === 'success') prefix = "✅ ";
  if (options.type === 'error') prefix = "⚠️ ";
  if (options.type === 'warning') prefix = "✋ ";
  if (options.type === 'info') prefix = "ℹ️ ";
  
  toastElement.textContent = prefix + message;
  toastContainer.appendChild(toastElement);
  
  setTimeout(() => {
    toastElement.style.animation = "slideOut 0.3s ease-in";
    toastElement.style.animationFillMode = "forwards";
    setTimeout(() => toastElement.remove(), 300);
  }, options.duration || 3000);
};

const createToastContainer = () => {
  const container = document.createElement("div");
  container.id = "toast-container";
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  `;
  document.body.appendChild(container);
  return container;
};