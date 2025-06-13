import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const isLoggedIn = !!localStorage.getItem('access_token');

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-r from-purple-700 to-purple-500 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to E-Learn</h1>
        <p className="text-lg md:text-2xl mb-8 max-w-2xl">
          Your modern online learning platform. Learn at your own pace, anywhere.
        </p>
        <Link
          to={isLoggedIn ? "/courses" : "/signup"}
          className="bg-white text-purple-700 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
        >
          {isLoggedIn ? "Browse Courses" : "Get Started for Free"}
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Expert Instructors",
              desc: "Learn from industry leaders and certified professionals.",
              icon: "👨‍🏫",
            },
            {
              title: "Flexible Learning",
              desc: "Access courses anytime, anywhere, on any device.",
              icon: "📱",
            },
            {
              title: "Certifications",
              desc: "Earn certificates to boost your resume and skills.",
              icon: "📜",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-purple-700">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-purple-700 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to start your learning journey?
        </h2>
        <Link
          to={isLoggedIn ? "/courses" : "/signup"}
          className="inline-block bg-white text-purple-700 font-semibold px-8 py-4 rounded shadow hover:bg-gray-100 transition"
        >
          {isLoggedIn ? "Explore Courses" : "Join Now"}
        </Link>
      </section>
    </main>
  );
}
