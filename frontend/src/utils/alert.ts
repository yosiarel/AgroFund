import Swal, { type SweetAlertOptions } from 'sweetalert2';

import { LOTTIE_SUCCESS, LOTTIE_WARNING } from '../constants/assets';

export const showSuccessAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    html: `
      <dotlottie-player src="${LOTTIE_SUCCESS}" background="transparent" speed="1.5" style="width: 120px; height: 120px; margin: 0 auto;" autoplay></dotlottie-player>
      <p class="mt-4 text-gray-600">${text}</p>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Oke',
    confirmButtonColor: '#10B981',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'px-6 py-2.5 rounded-xl font-medium'
    }
  });
};

export const showErrorAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    icon: 'error',
    html: `<p class="mt-2 text-gray-600">${text}</p>`,
    showConfirmButton: true,
    confirmButtonText: 'Oke',
    confirmButtonColor: '#EF4444',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'px-6 py-2.5 rounded-xl font-medium'
    }
  });
};

export const customAlert = (options: SweetAlertOptions & { type?: 'success' | 'error' | 'warning' }) => {
  const { type, ...swalOptions } = options;
  let html = swalOptions.html || `<p class="mt-4 text-gray-600">${swalOptions.text || ''}</p>`;

  if (type === 'success') {
    html = `<dotlottie-player src="${LOTTIE_SUCCESS}" background="transparent" speed="1.5" style="width: 120px; height: 120px; margin: 0 auto;" autoplay></dotlottie-player>` + html;
  } else if (type === 'warning') {
    html = `<dotlottie-player src="${LOTTIE_WARNING}" background="transparent" speed="1.5" style="width: 120px; height: 120px; margin: 0 auto;" autoplay></dotlottie-player>` + html;
  }

  return Swal.fire({
    ...swalOptions,
    icon: type === 'error' ? 'error' : undefined,
    html,
    text: undefined,
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'px-6 py-2.5 rounded-xl font-medium',
      cancelButton: 'px-6 py-2.5 rounded-xl font-medium',
      ...(swalOptions.customClass as object || {})
    }
  });
};
