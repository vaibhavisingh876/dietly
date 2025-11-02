import React from 'react';
import { Leaf, Apple, TrendingUp, Users, Target, BarChart3, Heart, Calendar, User } from 'lucide-react';

export default function DashboardPage() {
  const features = [
    {
      icon: <Apple className="w-8 h-8" />,
      title: "Smart Meal Analysis",
      description: "Get instant nutritional and health insights for every meal you log — powered by AI."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Personalized Feedback",
      description: "Receive meaningful suggestions to improve your eating habits and balance your diet."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Daily Streak Tracking",
      description: "Stay motivated with streaks that reward consistency in logging meals and healthy choices."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Macro Tracking",
      description: "Monitor your protein, carbs, and fats intake to ensure balanced nutrition every day."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Meal History & Progress",
      description: "Easily view your past meals and monitor how your eating habits evolve over time."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "AI-Driven Health Insights",
      description: "Go beyond calorie counts — understand the true nutritional impact of your food."
    }
  ];

  const team = [
    {
      name: "Nitya Singh ",
      
      image: "SJ"
    },
    {
      name: "Shreya Bisht ",
  
      image: "MC"
    },
    {
      name: "Shreya Rathore ",
     
      image: "ER"
    },
    {
      name: "Vaibhavi Singh",
      
      image: "DK"
    }
  ];

  return (
    <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0, backgroundColor: '#ffffff' }}>
      {/* Navigation Bar */}
      <nav style={{ width: '100%', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px 50px', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Leaf style={{ width: '32px', height: '32px', color: '#16a34a' }} />
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>Dietly</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <a href="#about" style={{ color: '#374151', fontWeight: '500', fontSize: '16px', textDecoration: 'none' }}>About</a>
            <a href="#features" style={{ color: '#374151', fontWeight: '500', fontSize: '16px', textDecoration: 'none' }}>Features</a>
            <a href="#team" style={{ color: '#374151', fontWeight: '500', fontSize: '16px', textDecoration: 'none' }}>Team</a>
            <button style={{ padding: '10px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>



      {/* About Section */}
      <section id="about" style={{ padding: '100px 50px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>
            About Our App
          </h2>
          <div style={{ height: '4px', width: '80px', backgroundColor: '#16a34a', margin: '0 auto 50px' }}></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.8', marginBottom: '24px' }}>
                Dietly is your personal meal companion designed to make healthy eating effortless and smart. It helps you understand what’s really on your plate by analyzing your meals and giving you clear, AI-powered insights into their nutritional value and overall health impact..
              </p>
              <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.8', marginBottom: '24px' }}>
                It encourages you to stay consistent with your eating goals through daily streaks that celebrate your progress and keep you motivated. Each time you log your meals, you not only track your food — you track your journey toward better habits.

              </p>
              <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.8' }}>
                Whether you’re focused on fitness, wellness, or simply mindful eating, Dietly makes it easier to stay informed, balanced, and consistent. It’s more than just a tracker — it’s your guide to building a healthier relationship with food.
              </p>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>50K+</div>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Active Users</div>
              </div>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>1M+</div>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Meals Tracked</div>
              </div>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#14b8a6', marginBottom: '8px' }}>4.8★</div>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>User Rating</div>
              </div>
              <div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>100+</div>
                <div style={{ fontSize: '16px', color: '#6b7280' }}>Countries Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 50px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>
            Powerful Features
          </h2>
          <div style={{ height: '4px', width: '80px', backgroundColor: '#16a34a', margin: '0 auto 50px' }}></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '16px', 
                padding: '40px 30px', 
                border: '2px solid #e5e7eb',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#16a34a';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(22, 163, 74, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: '#dcfce7', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#16a34a',
                  marginBottom: '24px'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" style={{ padding: '100px 50px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>
            Meet Our Team
          </h2>
          <div style={{ height: '4px', width: '80px', backgroundColor: '#16a34a', margin: '0 auto 50px' }}></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
            {team.map((member, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: '0 10px 30px rgba(22, 163, 74, 0.3)'
                }}>
                  {member.image}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                  {member.name}
                </h3>
                <p style={{ fontSize: '16px', color: '#16a34a', fontWeight: '500' }}>
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', padding: '60px 50px 30px', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '50px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Leaf style={{ width: '32px', height: '32px', color: '#16a34a' }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Dietly</span>
              </div>
              <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6' }}>
                Feed Your Ambition, Not Just Your Appetite.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Product</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Features</a>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Pricing</a>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Download</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>About Us</a>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Careers</a>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Terms of Service</a>
                <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none' }}>Cookie Policy</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: '30px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              © 2025 Dietly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

