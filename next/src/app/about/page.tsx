// app/about/page.tsx (Next.js 13+ app directory)
import React from 'react';

export default function AboutPage() {

  const companyName = 'ModernStore';
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">About {companyName}</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          At {companyName}, our mission is to bring the latest and most reliable electronic devices to your doorstep.
          From smartphones to home appliances, we aim to provide high-quality products that make life easier and more enjoyable.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our History</h2>
        <p className="text-gray-700 leading-relaxed">
          Founded in 2010, {companyName} started as a small electronics store and has grown into a trusted online destination
          for tech enthusiasts across the globe. Our dedication to quality and customer satisfaction has driven our success.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
          <li>Wide selection of electronic products</li>
          <li>Competitive pricing and great deals</li>
          <li>Fast and reliable shipping</li>
          <li>Excellent customer support</li>
          <li>Secure and easy online shopping experience</li>
        </ul>
      </section>
    </main>
  );
};


