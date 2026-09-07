import React, { useState } from 'react';
import { Phone, Mail, ChevronDown } from 'lucide-react';
import { faqs } from '../constants/faqs';
import { TopBarLayout } from '../components/layout/TopBarLayout';
import { type NavItem } from '../components/layout/TopBarLayout';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const publicNavItems: NavItem[] = [
    { title: 'Beranda', href: '/' },
    { title: 'Proyek', href: '/projects' },
    { title: 'FAQ', href: '/faq' },
  ];

  return (
    <TopBarLayout navItems={publicNavItems} fullWidth={false}>
      <div className="w-full bg-white min-h-[calc(100vh-64px)] py-12 lg:py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

          <div className="w-full lg:w-5/12 flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-32 h-fit">
            <h1 className="text-[var(--text-display-l)] sm:text-5xl font-bold text-[var(--color-neutral-900)] mb-6 tracking-tight leading-tight">
              Pertanyaan &<br className="hidden lg:block" />Jawaban
            </h1>
            <p className="text-[var(--color-neutral-500)] mb-10 text-[var(--text-body-l)]">
              Temukan jawaban dari pertanyaan yang paling sering diajukan mengenai sistem kerja AgroFund. Jika masih bingung, jangan ragu untuk menghubungi tim kami:
            </p>

            <div className="space-y-4 flex flex-col items-center lg:items-start">
              <div className="flex items-center gap-4 text-[var(--color-neutral-700)] hover:text-[var(--color-primary-600)] transition-colors cursor-pointer group w-fit">
                <div className="w-12 h-12 bg-[var(--color-neutral-50)] rounded-2xl flex items-center justify-center shadow-sm border border-[var(--color-neutral-100)] group-hover:border-[var(--color-primary-200)] group-hover:bg-[var(--color-primary-50)] transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-semibold">+62 811 2345 6789</span>
              </div>

              <div className="flex items-center gap-4 text-[var(--color-neutral-700)] hover:text-[var(--color-primary-600)] transition-colors cursor-pointer group w-fit">
                <div className="w-12 h-12 bg-[var(--color-neutral-50)] rounded-2xl flex items-center justify-center shadow-sm border border-[var(--color-neutral-100)] group-hover:border-[var(--color-primary-200)] group-hover:bg-[var(--color-primary-50)] transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-semibold">bantuan@agrofund.com</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-7/12 flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer shadow-sm
                    ${isOpen ? 'border-[var(--color-primary-600)] shadow-[var(--shadow-e1)]' : 'border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]'}
                  `}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <div className="px-6 py-5 flex items-center gap-4">
                    <span className={`text-[var(--text-body-s)] font-bold w-6 shrink-0 transition-colors ${isOpen ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-neutral-400)]'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className={`font-semibold flex-1 transition-colors text-[var(--text-body-l)] ${isOpen ? 'text-[var(--color-neutral-900)]' : 'text-[var(--color-neutral-700)]'}`}>
                      {faq.question}
                    </h3>
                    <div className={`shrink-0 transition-transform duration-300 text-[var(--color-neutral-400)] ${isOpen ? 'rotate-180 text-[var(--color-primary-600)]' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>

                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out`}
                    style={{ maxHeight: isOpen ? '400px' : '0px', opacity: isOpen ? 1 : 0 }}
                  >
                    <p className="text-[var(--color-neutral-600)] pb-5 pt-2 sm:pl-10 border-t border-[var(--color-neutral-50)] leading-relaxed text-[var(--text-body-m)]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TopBarLayout>
  );
};
