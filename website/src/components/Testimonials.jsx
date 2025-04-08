import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "SEO.engineering has transformed how we handle technical SEO for our clients. What used to take weeks now happens in hours, with better results.",
      author: "Sarah Johnson",
      role: "SEO Director",
      company: "Digital Growth Agency",
      avatar: "/testimonials/avatar1.jpg"
    },
    {
      quote: "I was skeptical at first, but SEO.engineering identified and fixed issues our team had missed for months. Our organic traffic is up 43% since implementing it.",
      author: "Michael Chen",
      role: "Marketing Manager",
      company: "TechStart Solutions",
      avatar: "/testimonials/avatar2.jpg"
    },
    {
      quote: "The automated fixes have been a game-changer for us. No more back-and-forth with developers - just approve and it's done. Incredible time savings.",
      author: "Alex Rodriguez",
      role: "Owner",
      company: "Rodriguez Web Consultancy",
      avatar: "/testimonials/avatar3.jpg"
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-4 mb-6">
            Trusted by Agencies & Marketing Teams
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from our customers who have transformed their technical SEO workflows 
            with our automated platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-yellow-400 inline-block" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-gray-600 italic mb-6 flex-grow">"{testimonial.quote}"</p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {/* In production, this would be an actual image */}
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {testimonial.author.charAt(0)}
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center pb-1 border-b-2 border-primary-500">
            <span className="text-primary-600 font-medium mr-2">Read more customer stories</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-primary-600" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;