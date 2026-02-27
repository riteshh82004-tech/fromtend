import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bluetooth, Wifi, Usb, Star, ShoppingCart, BookOpen, Play } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ShopKnowledge: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'devices' | 'subscription' | 'articles'>('devices');

  const devices = [
    {
      id: 1,
      name: 'CardioCare Pro ECG',
      type: 'ECG Monitor',
      price: 2499,
      rating: 4.8,
      features: ['12-lead ECG', 'Bluetooth 5.0', 'AI Analysis', '30-day battery'],
      connectivity: ['bluetooth', 'wifi'],
      image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400',
      isNew: true
    },
    {
      id: 2,
      name: 'PulseOx Pro',
      type: 'SpO₂ Monitor',
      price: 1849,
      rating: 4.6,
      features: ['Fingertip sensor', 'Real-time tracking', 'Mobile app', 'Color display'],
      connectivity: ['bluetooth'],
      image: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'GlucoCheck Smart',
      type: 'Glucose Monitor',
      price: 1499,
      rating: 4.5,
      features: ['No strips needed', 'Continuous monitoring', 'Trend alerts', 'Water resistant'],
      connectivity: ['bluetooth', 'usb'],
      image: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: 99,
      period: 'month',
      features: ['Basic health tracking', 'Monthly reports', 'Mobile app access', 'Email support'],
      color: 'from-gray-400 to-gray-500',
      popular: false
    },
    {
      name: 'Premium',
      price: 299,
      period: 'month',
      features: ['Advanced analytics', 'Real-time monitoring', 'AI health insights', 'Priority support', 'Multiple devices'],
      color: 'from-blue-500 to-blue-600',
      popular: true
    },
    {
      name: 'Clinical',
      price: 499,
      period: 'month',
      features: ['Multi-patient management', 'Clinical reports', 'API access', 'White-label options', '24/7 support'],
      color: 'from-purple-500 to-purple-600',
      popular: false
    }
  ];

  const articles = [
    {
      id: 1,
      title: 'Understanding ECG Readings',
      category: 'ECG Basics',
      readTime: '5 min',
      image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'Learn how to interpret basic ECG patterns and what they mean for your heart health.'
    },
    {
      id: 2,
      title: 'SpO₂ Levels: What\'s Normal?',
      category: 'Health Tips',
      readTime: '3 min',
      image: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'Understanding oxygen saturation levels and when to be concerned about low readings.'
    },
    {
      id: 3,
      title: 'Managing Blood Glucose',
      category: 'Diabetes Care',
      readTime: '7 min',
      image: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'Essential tips for monitoring and managing blood glucose levels effectively.'
    },
    {
      id: 4,
      title: 'Exercise and Heart Health',
      category: 'Lifestyle',
      readTime: '6 min',
      image: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'How regular exercise impacts your cardiovascular health and improves overall wellbeing.'
    }
  ];

  const getConnectivityIcon = (type: string) => {
    switch (type) {
      case 'bluetooth': return Bluetooth;
      case 'wifi': return Wifi;
      case 'usb': return Usb;
      default: return Bluetooth;
    }
  };

  const sections = [
    { key: 'devices' as const, label: 'Devices', icon: Heart },
    { key: 'subscription' as const, label: 'Plans', icon: Star },
    { key: 'articles' as const, label: 'Knowledge', icon: BookOpen }
  ];

  const renderDevicesSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Health Monitoring Devices</h2>
        <p className="text-gray-600">Professional-grade devices for accurate health monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card key={device.id} hover className="overflow-hidden">
            <div className="relative">
              <img 
                src={device.image} 
                alt={device.name}
                className="w-full h-48 object-cover rounded-2xl"
              />
              {device.isNew && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                  NEW
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{device.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{device.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{device.type}</p>

              <div className="space-y-3">
                {/* Features */}
                <div className="space-y-1">
                  {device.features.map((feature, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-center">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Connectivity */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Connectivity:</span>
                  {device.connectivity.map((conn) => {
                    const Icon = getConnectivityIcon(conn);
                    return (
                      <Icon key={conn} className="w-4 h-4 text-gray-400" />
                    );
                  })}
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">₹{device.price}</div>
                  <Button size="sm" icon={ShoppingCart}>
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSubscriptionSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Plans</h2>
        <p className="text-gray-600">Choose the plan that fits your health monitoring needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-800">₹{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                
                <div 
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}
                >
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                className="w-full"
                variant={plan.popular ? 'primary' : 'outline'}
              >
                {plan.popular ? 'Get Started' : 'Choose Plan'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderArticlesSection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Health Knowledge Base</h2>
        <p className="text-gray-600">Expert articles and guides for better health understanding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="overflow-hidden">
              <div className="flex space-x-4">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-2xl flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.readTime} read</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
                  
                  <Button variant="outline" size="sm" className="mt-3" icon={BookOpen}>
                    Read More
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Featured Video Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Featured Video</h3>
            <p className="text-gray-600 mb-4">
              "Complete Guide to Home Health Monitoring" - 15 min tutorial
            </p>
            <Button icon={Play}>
              Watch Now
            </Button>
          </div>
          <div className="w-32 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shop & Knowledge Center</h1>
          <p className="text-gray-600">Devices, plans, and expert knowledge for your health journey</p>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center justify-center space-x-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(section.key)}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-200
                  ${activeSection === section.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                <Icon size={18} />
                <span>{section.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Section Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === 'devices' && renderDevicesSection()}
          {activeSection === 'subscription' && renderSubscriptionSection()}
          {activeSection === 'articles' && renderArticlesSection()}
        </motion.div>
      </div>
    </div>
  );
};