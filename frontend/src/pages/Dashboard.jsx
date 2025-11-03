import React from 'react';
import { Leaf, Apple, TrendingUp, Users, Target, BarChart3, Heart, Calendar, User, Sparkles } from 'lucide-react';
import Nav from "../components/Nav"; // Import your navbar

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
      {/* Navigation Bar - Pass currentPage prop */}
      <Nav currentPage="Dashboard" />

      {/* NEW: Welcome Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(22, 163, 74, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-50px',
          left: '-50px',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-30px); }
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes sparkle {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }

          `}
        </style>

        <div style={{ 
          textAlign: 'center', 
          maxWidth: '900px', 
          padding: '0 20px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo with sparkle effect */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '32px',
            animation: 'fadeInUp 1s ease-out'
          }}>
            <div style={{ position: 'relative' }}>
              <Leaf style={{ 
                width: '80px', 
                height: '80px', 
                color: '#16a34a',
                filter: 'drop-shadow(0 4px 12px rgba(22, 163, 74, 0.3))'
              }} />
              <Sparkles style={{
                width: '24px',
                height: '24px',
                color: '#16a34a',
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                animation: 'sparkle 2s ease-in-out infinite'
              }} />
            </div>
          </div>

          {/* Main Heading */}
          <h1 style={{ 
            fontSize: '72px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '24px',
            lineHeight: '1.1',
            animation: 'fadeInUp 1s ease-out 0.2s both',
            textShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            Welcome to <span style={{ 
              background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Dietly</span>
          </h1>

          {/* Tagline */}
          <p style={{ 
            fontSize: '28px', 
            color: '#374151',
            fontWeight: '500',
            marginBottom: '48px',
            animation: 'fadeInUp 1s ease-out 0.4s both',
            letterSpacing: '0.5px'
          }}>
            Feed Your Ambition, Not Just Your Appetite.
          </p>

          {/* Subtitle */}
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.8',
            animation: 'fadeInUp 1s ease-out 0.6s both'
          }}>
            Your personal meal companion designed to make healthy eating effortless and smart. 
            Track, analyze, and transform your eating habits with AI-powered insights.
          </p>

          {/* CTA Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            justifyContent: 'center',
            animation: 'fadeInUp 1s ease-out 0.8s both'
          }}>
            <button 
              onClick={() => {
                document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(22, 163, 74, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(22, 163, 74, 0.3)';
            }}>
              Get Started
            </button>
            
            <button style={{
              padding: '16px 40px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#16a34a',
              background: 'white',
              border: '2px solid #16a34a',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0fdf4';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

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
                Dietly is your personal meal companion designed to make healthy eating effortless and smart. It helps you understand what's really on your plate by analyzing your meals and giving you clear, AI-powered insights into their nutritional value and overall health impact..
              </p>
              <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.8', marginBottom: '24px' }}>
                It encourages you to stay consistent with your eating goals through daily streaks that celebrate your progress and keep you motivated. Each time you log your meals, you not only track your food — you track your journey toward better habits.

              </p>
              <p style={{ fontSize: '18px', color: '#374151', lineHeight: '1.8' }}>
                Whether you're focused on fitness, wellness, or simply mindful eating, Dietly makes it easier to stay informed, balanced, and consistent. It's more than just a tracker — it's your guide to building a healthier relationship with food.
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
