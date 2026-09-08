import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LOTTIE_NOTFOUND } from '../constants/assets';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-md w-full">
        <div
          className="w-full flex justify-center mb-4"
          dangerouslySetInnerHTML={{
            __html: `<dotlottie-player src="${LOTTIE_NOTFOUND}" background="transparent" speed="1" style="width: 300px; height: 300px;" loop autoplay></dotlottie-player>`
          }}
        />

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-600 mb-8">
          Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau memang tidak pernah ada.
        </p>

        <Button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto px-8"
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
};
