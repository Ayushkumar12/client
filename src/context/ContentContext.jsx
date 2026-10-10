import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const ContentContext = createContext(null);

export const DEFAULT_SITE_CONTENT = {
  brand: {
    name: 'OCT9',
    tagline: 'Fashion & Ethnic Wear',
    sub_tagline: 'Women\'s Ethnic Wear & Dresses',
    announcement_bar: 'Complimentary Express Delivery on All Orders Across India',
    support_phone: '+91 98765 43210',
    support_email: 'support@oct9.com',
    whatsapp_number: '919876543210',
    address: 'OCT9 Fashion Store, New Delhi 110049',
    instagram_url: 'https://instagram.com',
    facebook_url: 'https://facebook.com',
    pinterest_url: 'https://pinterest.com'
  },
  hero_slides: [
    {
      id: 1,
      image: '/banners/hero_banner_2.png',
      alt: 'Luxury Indian Ethnic Wear',
      title: 'Royal Ethnic Collection',
      subtitle: 'Festive & Bridal Collection 2026',
      link: '/category/stitched-suits',
      active: true,
      order: 1
    },
    {
      id: 2,
      image: '/banners/hero_banner_5.png',
      alt: 'Pure Silk Sarees',
      title: 'Handloom Silk Sarees',
      subtitle: 'Pure Mulberry & Kanjivaram Weaves',
      link: '/category/sarees',
      active: true,
      order: 2
    },
    {
      id: 3,
      image: '/banners/hero_banner_1.png',
      alt: 'Designer Suits',
      title: 'Designer Tailored Suits',
      subtitle: 'Farshi, Anarkali & Palazzo Sets',
      link: '/category/stitched-suits',
      active: true,
      order: 3
    },
    {
      id: 4,
      image: '/banners/hero_banner_4.png',
      alt: 'Festive Collection',
      title: 'Festive Gala Edition',
      subtitle: 'Zardozi Embroidery & Regal Velvet',
      link: '/category/festive-wear',
      active: true,
      order: 4
    },
    {
      id: 5,
      image: '/banners/hero_banner_6.png',
      alt: 'Fine Ornaments',
      title: 'Zewar-e-Khaas Jewels',
      subtitle: 'Handcrafted Kundan & Polki Treasures',
      link: '/category/accessories',
      active: true,
      order: 5
    },
    {
      id: 6,
      image: '/banners/hero_banner_3.png',
      alt: 'Punjabi Jutti & Mojari',
      title: 'Artisan Punjabi Juttis',
      subtitle: 'Pure Leather & Embroidered Mojaris',
      link: '/category/jutti',
      active: true,
      order: 6
    }
  ],
  jharokha_categories: [
    {
      id: 'zewar',
      name: 'Zewar',
      slug: 'accessories',
      link: '/category/accessories',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=85',
      tagline: 'Royal Jewels & Polki',
      active: true
    },
    {
      id: 'new-arrivals',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      link: '/new-arrivals',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85',
      tagline: 'Fresh 2026 Drop',
      active: true
    },
    {
      id: 'farshi-salwaar',
      name: 'Farshi Salwaar Set',
      slug: 'suits',
      link: '/category/suits?sub_category=Punjabi+Suit',
      image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=85',
      tagline: 'Heritage Cut',
      active: true
    },
    {
      id: 'a-line',
      name: 'A Line Set',
      slug: 'suits',
      link: '/category/suits?sub_category=Straight+Suit',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85',
      tagline: 'Graceful Flow',
      active: true
    },
    {
      id: 'straight-fit',
      name: 'Straight Fit',
      slug: 'designer-suits',
      link: '/category/designer-suits',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85',
      tagline: 'Sharp Elegance',
      active: true
    },
    {
      id: 'anarkali-set',
      name: 'Anarkali Set',
      slug: 'festive-wear',
      link: '/category/festive-wear',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
      tagline: 'Imperial Flare',
      active: true
    },
    {
      id: 'sharara-set',
      name: 'Sharara Set',
      slug: 'suits',
      link: '/category/suits?sub_category=Sharara+Suit',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85',
      tagline: 'Regal Twirl',
      active: true
    },
    {
      id: 'sarees',
      name: 'Designer Sarees',
      slug: 'sarees',
      link: '/category/sarees',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=85',
      tagline: 'Royal Drapes',
      active: true
    }
  ],
  sections: {
    new_arrivals: {
      badge: 'JUST DROPPED • NEW COLLECTION',
      title: 'New Arrivals',
      subtitle: 'Freshly tailored suits, intricate embroidery, and beautiful sarees.',
      cta_text: 'View All 50+ New Styles'
    },
    brand_picks: {
      badge: 'Curated Selection',
      title: 'The OCT9 Edit',
      subtitle: 'Handpicked styles curated for effortless elegance, comfort, and everyday charm.',
      cta_text: 'Explore The Curated Edit'
    },
    inside_brand: {
      badge: 'About Our Brand',
      title: 'Inside OCT9',
      italic_tagline: 'Everyday elegance and comfort for every occasion.',
      description: 'At OCT9, each outfit honours the rich legacy of Indian fabrics. From intricate threadwork to hand-selected pure silks, we bring you timeless clothing made to last.',
      cta_text: 'Explore Products',
      arches: [
        {
          title: 'Stitched Suits',
          subtitle: 'Anarkali & Farshi Sets',
          badge: 'Ready-to-Wear',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=85',
          link: '/category/stitched-suits'
        },
        {
          title: 'Unstitched Suits',
          subtitle: 'Pure Mulberry & Roman Silks',
          badge: 'Unstitched Fabric',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85',
          link: '/category/unstitched-suits'
        },
        {
          title: 'Heritage Sarees',
          subtitle: 'Organza & Banarasi Weaves',
          badge: 'Festive Sarees',
          image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=700&q=85',
          link: '/category/sarees'
        }
      ]
    },
    adorned_jewels: {
      badge: 'Jewellery Collection',
      title: 'Adorned to Perfection',
      subtitle: 'Complete your festive look with hand-selected Kundan, Meenakari, and pearl statement jewels.',
      cta_text: 'Explore Full Jewellery Collection'
    },
    bento_mosaic: {
      badge: 'Shop Collections',
      title: 'Shop by Budget & Category',
      subtitle: 'Discover quality ethnic wear tailored for every celebratory occasion and budget.',
      zewar_card: {
        tag: 'Jewellery & Gifts',
        title: 'ZEWAR',
        subtitle: 'by OCT9',
        description: 'Handcrafted Kundan, Polki & Pearl masterpieces.',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85',
        link: '/category/accessories',
        cta_text: 'Shop Jewellery'
      },
      categories: [
        {
          title: 'New Arrivals',
          link: '/new-arrivals',
          image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Under ₹2,500',
          link: '/category/all?max_price=2500',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: '₹2,500 – ₹7,500',
          link: '/category/all?min_price=2500&max_price=7500',
          image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Above ₹7,500',
          link: '/category/all?min_price=7500',
          image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Stitched Suits',
          link: '/category/stitched-suits',
          image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85'
        },
        {
          title: 'Royal Sarees',
          link: '/category/sarees',
          image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=85'
        }
      ]
    }
  },
  pillars: [
    {
      id: 1,
      title: 'Artisan Made',
      desc: 'Handcrafted heritage & fine embroidery'
    },
    {
      id: 2,
      title: 'Weekly Launches',
      desc: 'Curated festive edits & fresh designer drops'
    },
    {
      id: 3,
      title: 'Premium Fabrics',
      desc: 'Pure silks, fine chanderi & soft cottons'
    },
    {
      id: 4,
      title: 'Quality Stitching',
      desc: 'Careful craftsmanship & precision tailoring'
    }
  ],
  page_availability: {
    'stitched-suits': { status: 'active', title: 'Stitched Suits', teaser: 'Ready-to-wear Farshi, Anarkali and Palazzo sets.', launch_date: '' },
    'unstitched-suits': { status: 'active', title: 'Unstitched Suits', teaser: 'Pure Mulberry and Roman silk unstitched sets.', launch_date: '' },
    'sarees': { status: 'active', title: 'Sarees', teaser: 'Royal heritage weaves in Kanjivaram, Organza and Silk.', launch_date: '' },
    'designer-suits': { status: 'active', title: 'Designer Suits', teaser: 'Designer suits tailored for weddings and festive wear.', launch_date: '' },
    'festive-wear': { status: 'active', title: 'Festive Wear', teaser: 'Festive celebrations and party wear styles.', launch_date: '' },
    'party-wear': { status: 'active', title: 'Party Wear', teaser: 'Glamorous sequin and velvet outfits.', launch_date: '' },
    'accessories': { status: 'active', title: 'Accessories & Jewels', teaser: 'Handcrafted Kundan and Polki treasures.', launch_date: '' },
    'jutti': { status: 'active', title: 'Punjabi Juttis', teaser: 'Authentic handmade leather and embroidered juttis.', launch_date: '' },
    'new-arrivals': { status: 'active', title: 'New Arrivals', teaser: 'Fresh drops straight from our newest collection.', launch_date: '' }
  },
  pages: {
    contact: {
      badge: 'Customer Support',
      title: 'Contact Us',
      subtitle: 'We are here to assist you with sizing, styling advice, order tracking & inquiries.',
      phone: '+91 98765 43210',
      email: 'support@oct9.com',
      whatsapp: '919876543210',
      hours: 'Monday – Saturday: 10:00 AM – 7:30 PM IST',
      address: 'OCT9 Flagship Studio, Fashion Hub, Shahpur Jat, New Delhi 110049',
      response_time: 'Within 2 business hours',
      custom_message: 'For bridal inquiries, custom made-to-measure sizing, or bulk orders, reach out directly to our team.'
    },
    shipping: {
      badge: 'Domestic & Global Delivery',
      title: 'Shipping & Delivery Policy',
      subtitle: 'Insured express shipping across India powered by Shiprocket & premium air courier partners.',
      free_shipping_threshold: '0',
      standard_shipping_fee: '0',
      dispatch_ready: '24–48 Hours',
      dispatch_tailored: '5–7 Business Days',
      delivery_metro: '2–4 Business Days',
      delivery_rest: '4–7 Business Days',
      courier_partners: 'Bluedart, Delhivery, DTDC, Xpressbees & Shadowfax via Shiprocket',
      sections: [
        {
          title: '1. Order Processing & Dispatch Timelines',
          content: 'All ready-to-wear orders (Stitched Suits, Sarees, Accessories & Juttis) are processed and dispatched within 24 to 48 business hours from our New Delhi facility. Semi-stitched and custom-tailored orders require 5–7 business days for hand-embroidery inspection and precision finishing.'
        },
        {
          title: '2. Shipping Charges & Free Shipping',
          content: 'We offer 100% FREE insured express shipping on all prepaid and COD orders across India with no minimum order value.'
        },
        {
          title: '3. Real-Time Tracking via Shiprocket',
          content: 'As soon as your shipment is handed over to our courier partner, you will receive an automated SMS, WhatsApp update, and email with your AWB tracking number and live Shiprocket tracking link.'
        },
        {
          title: '4. Tamper-Proof Packaging & Transit Insurance',
          content: 'Every OCT9 parcel is packed in multi-layered tamper-evident security bags with branded seals. All shipments are 100% insured against loss or transit damage.'
        },
        {
          title: '5. Non-Delivery & Address Corrections',
          content: 'Couriers will attempt delivery up to 3 times before returning the parcel. If you need to modify your delivery address or contact number, please reach out to our support team immediately before dispatch.'
        }
      ]
    },
    returns: {
      badge: 'Hassle-Free Returns',
      title: 'Returns & Exchanges Policy',
      subtitle: 'Enjoy peace of mind with our 7-day doorstep return and size exchange guarantee.',
      return_window: '7 Days from Delivery',
      exchange_window: '7 Days from Delivery',
      refund_timeline_prepaid: '3–5 Business Days to Original Payment Source',
      refund_timeline_cod: 'Instant Store Credit or Direct UPI/Bank Transfer within 24 Hours',
      steps: [
        {
          step: 1,
          title: 'Request Return or Exchange',
          desc: 'Visit your Account > Orders section or contact our support team via WhatsApp with your Order ID within 7 days of delivery.'
        },
        {
          step: 2,
          title: 'Doorstep Reverse Pickup',
          desc: 'Our logistics partner Shiprocket will arrange a free reverse pickup from your address within 24–48 hours.'
        },
        {
          step: 3,
          title: 'Quality Inspection',
          desc: 'Once the garment reaches our facility, our quality team inspects tags, seals, and fabric condition within 24 hours.'
        },
        {
          step: 4,
          title: 'Instant Refund or Replacement',
          desc: 'Your replacement size is dispatched immediately or full refund is initiated to your original payment method.'
        }
      ],
      eligible_items: 'Unworn, unwashed garments with original tags, designer security seals, and authentic packaging intact.',
      non_eligible_items: 'Custom-tailored / altered garments, final clearance sale items, and worn footwear/juttis.',
      cancellation_policy: 'Orders can be cancelled anytime before dispatch. Once dispatched, cancellation will be processed after delivery refusal or return.'
    },
    size_guide: {
      badge: 'Measurements & Fit',
      title: 'Size Guide & Tailoring Specifications',
      subtitle: 'Standard sizing charts in inches and centimeters for our ethnic collections.',
      how_to_measure: [
        { title: 'Bust', desc: 'Measure around the fullest part of your chest, keeping the tape comfortably snug.' },
        { title: 'Waist', desc: 'Measure around your natural waistline, typically 2 inches above the belly button.' },
        { title: 'Hips', desc: 'Measure around the widest point of your hips and buttocks while standing with feet together.' },
        { title: 'Kurta Length', desc: 'Measure from the highest shoulder point down to your desired hemline.' },
        { title: 'Shoulder', desc: 'Measure from the tip of one shoulder across the back curve to the other.' }
      ],
      suits_chart: [
        { size: 'XS', bust: '34', waist: '28', hip: '38', length: '44', shoulder: '14' },
        { size: 'S', bust: '36', waist: '30', hip: '40', length: '44', shoulder: '14.5' },
        { size: 'M', bust: '38', waist: '32', hip: '42', length: '45', shoulder: '15' },
        { size: 'L', bust: '40', waist: '34', hip: '44', length: '45', shoulder: '15.5' },
        { size: 'XL', bust: '42', waist: '36', hip: '46', length: '46', shoulder: '16' },
        { size: 'XXL', bust: '44', waist: '38', hip: '48', length: '46', shoulder: '16.5' },
        { size: '3XL', bust: '46', waist: '40', hip: '50', length: '46', shoulder: '17' }
      ],
      juttis_chart: [
        { ind_uk: '3', eu: '36', us: '5', foot_length: '22.5 cm' },
        { ind_uk: '4', eu: '37', us: '6', foot_length: '23.5 cm' },
        { ind_uk: '5', eu: '38', us: '7', foot_length: '24.0 cm' },
        { ind_uk: '6', eu: '39', us: '8', foot_length: '24.5 cm' },
        { ind_uk: '7', eu: '40', us: '9', foot_length: '25.5 cm' },
        { ind_uk: '8', eu: '41', us: '10', foot_length: '26.0 cm' }
      ],
      tailoring_info: 'We offer alterations for sleeve length and minor fit adjustments. For custom made-to-measure orders, contact our support team with your custom measurements.'
    },
    faq: {
      badge: 'Help & Support',
      title: 'Frequently Asked Questions',
      subtitle: 'Find fast answers to common questions about shopping, sizing, shipping, and returns at OCT9.',
      categories: [
        {
          name: 'Orders & Tracking',
          items: [
            {
              question: 'How do I track my order?',
              answer: 'You can track your order anytime by visiting our Track Order page (/track-order) and entering your Order ID or Shiprocket AWB number. You also receive real-time SMS & WhatsApp alerts.'
            },
            {
              question: 'Can I modify or cancel my order after placing it?',
              answer: 'You can modify your shipping address or cancel your order within 2 hours of placing it by contacting our support team on WhatsApp or phone.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major Credit/Debit Cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD).'
            }
          ]
        },
        {
          name: 'Shipping & Delivery',
          items: [
            {
              question: 'How long does delivery take?',
              answer: 'Metro cities typically receive deliveries within 2–4 business days. Rest of India takes 4–7 business days depending on pin code.'
            },
            {
              question: 'Is Cash on Delivery (COD) available?',
              answer: 'Yes, COD is available across 26,000+ pin codes in India for orders up to ₹10,000.'
            },
            {
              question: 'Are there any hidden shipping charges?',
              answer: 'No. All orders qualify for Free Express Shipping across India with no minimum order value.'
            }
          ]
        },
        {
          name: 'Returns & Exchanges',
          items: [
            {
              question: 'What is your return and exchange policy?',
              answer: 'We offer a 7-day hassle-free return and size exchange guarantee from the date of delivery. Items must have original tags attached.'
            },
            {
              question: 'How do I request a size exchange?',
              answer: 'Go to your Account > Orders page and click "Exchange Size", or message our support team on WhatsApp with your Order ID.'
            },
            {
              question: 'How long do refunds take?',
              answer: 'Prepaid refunds are credited to the source account in 3–5 business days after quality inspection. COD refunds are sent via direct UPI/NEFT within 24 hours.'
            }
          ]
        },
        {
          name: 'Sizing & Custom Tailoring',
          items: [
            {
              question: 'How do I choose the right size?',
              answer: 'Please refer to our comprehensive Size Guide (/size-guide) with exact measurements for bust, waist, and hip. When in doubt, we recommend choosing one size up for a relaxed fit.'
            },
            {
              question: 'Do you offer custom tailoring or unstitched fabric stitching?',
              answer: 'Yes! We provide tailoring and custom sleeve/neck alterations for our collections. Contact our support team for custom bridal and festive wear tailoring.'
            }
          ]
        }
      ]
    },
    terms: {
      badge: 'Legal Agreement',
      title: 'Terms & Conditions',
      subtitle: 'Please review our terms governing platform usage, product purchases, and intellectual property.',
      last_updated: 'October 2026',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By browsing, accessing, or making a purchase on OCT9 (oct9.com), you agree to comply with and be bound by these Terms and Conditions.'
        },
        {
          title: '2. Product Pricing & Accuracy',
          content: 'We strive for accurate color and embroidery depictions. Minor variations in shade or handcrafted embroidery may occur due to photography lighting and artisan handwork.'
        },
        {
          title: '3. Orders & Payment Security',
          content: 'All transactions are encrypted with 256-bit SSL encryption. We reserve the right to cancel orders with incorrect pricing or fraudulent payment indications.'
        },
        {
          title: '4. Intellectual Property',
          content: 'All graphics, designs, logos, and product imagery are exclusive intellectual property of OCT9 and cannot be reproduced without explicit written consent.'
        }
      ]
    },
    privacy: {
      badge: 'Data Security',
      title: 'Privacy Policy',
      subtitle: 'Your privacy is paramount. Learn how we safeguard your personal data and browsing information.',
      last_updated: 'October 2026',
      sections: [
        {
          title: '1. Information We Collect',
          content: 'We collect your name, email, delivery address, and phone number exclusively to process orders, communicate tracking updates, and provide customer support.'
        },
        {
          title: '2. How We Protect Your Data',
          content: 'We never sell, rent, or trade your personal data to third parties. Sensitive payment credentials are processed directly through secure PCI-DSS certified payment gateways.'
        },
        {
          title: '3. Cookies & Session Management',
          content: 'We use functional cookies solely to maintain your shopping cart, wishlist, and logged-in account preferences.'
        },
        {
          title: '4. Your Data Rights',
          content: 'You may request access to, correction of, or deletion of your customer account and personal data at any time by contacting support@oct9.com.'
        }
      ]
    },
    about: {
      badge: 'Heritage & Craft',
      title: 'About OCT9 Atelier',
      subtitle: 'Crafting luxury Indian ethnic wear that celebrates hereditary weaves, timeless grace, and everyday elegance.',
      story: 'Founded with a passion for authentic Indian textiles, OCT9 blends classical artisanal artistry with modern silhouettes. Each garment is meticulously crafted by generational artisans using pure mulberry silks, hand-loomed chanderi, and intricate zardozi threadwork. We believe true luxury lies in comfort, authentic craftsmanship, and accessible elegance.',
      values: [
        { title: 'Generational Craftsmanship', desc: 'Working directly with traditional artisan communities to keep hand-weaving and embroidery heritage alive.' },
        { title: 'Pure Fabrics Only', desc: 'We source only tested pure silks, organic cottons, and breathable organza fabrics.' },
        { title: 'Tailored Perfection', desc: 'Every stitch is inspected by master tailors to guarantee impeccable drape and enduring longevity.' }
      ]
    }
  }
};

const API_BASE = '/api/content';

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  // Fetch Public Content
  const fetchContent = useCallback(async () => {
    try {
      const data = await api.getPublicContent();
      if (data && data.success && data.content) {
        setContent((prev) => ({
          ...DEFAULT_SITE_CONTENT,
          ...data.content,
          brand: { ...DEFAULT_SITE_CONTENT.brand, ...(data.content.brand || {}) },
          sections: { ...DEFAULT_SITE_CONTENT.sections, ...(data.content.sections || {}) },
          page_availability: { ...DEFAULT_SITE_CONTENT.page_availability, ...(data.content.page_availability || {}) },
          pages: {
            ...DEFAULT_SITE_CONTENT.pages,
            ...(data.content.pages || {}),
            contact: { ...DEFAULT_SITE_CONTENT.pages.contact, ...(data.content.pages?.contact || {}) },
            shipping: { ...DEFAULT_SITE_CONTENT.pages.shipping, ...(data.content.pages?.shipping || {}) },
            returns: { ...DEFAULT_SITE_CONTENT.pages.returns, ...(data.content.pages?.returns || {}) },
            size_guide: { ...DEFAULT_SITE_CONTENT.pages.size_guide, ...(data.content.pages?.size_guide || {}) },
            faq: { ...DEFAULT_SITE_CONTENT.pages.faq, ...(data.content.pages?.faq || {}) },
            terms: { ...DEFAULT_SITE_CONTENT.pages.terms, ...(data.content.pages?.terms || {}) },
            privacy: { ...DEFAULT_SITE_CONTENT.pages.privacy, ...(data.content.pages?.privacy || {}) },
            about: { ...DEFAULT_SITE_CONTENT.pages.about, ...(data.content.pages?.about || {}) }
          }
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch CMS content, using default fallbacks:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Admin Update Content
  const updateContent = async (updates) => {
    try {
      const data = await api.updateAdminContent(updates);
      if (data && data.success && data.content) {
        setContent(data.content);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to update content' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // Admin Reset Section
  const resetSection = async (section) => {
    try {
      const data = await api.resetAdminContent(section);
      if (data && data.success && data.content) {
        setContent(data.content);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to reset content' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  // Helper: Get Page Availability Status
  const getPageAvailability = (slug) => {
    if (!slug) return { status: 'active', title: 'All Collections', teaser: '', launch_date: '' };
    const normalized = slug.toLowerCase();
    const match = content.page_availability?.[normalized];
    if (match) return match;

    // Aliases
    if (normalized === 'suits' && content.page_availability?.['stitched-suits']) {
      return content.page_availability['stitched-suits'];
    }
    if (normalized === 'juttis' && content.page_availability?.['jutti']) {
      return content.page_availability['jutti'];
    }
    if (normalized === 'saree' && content.page_availability?.['sarees']) {
      return content.page_availability['sarees'];
    }

    return {
      status: 'active',
      title: slug.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      teaser: '',
      launch_date: ''
    };
  };

  // Helper: Is Page Coming Soon
  const isComingSoon = (slug) => {
    const info = getPageAvailability(slug);
    return info && info.status === 'coming_soon';
  };

  // Helper: Is Page Maintenance
  const isMaintenance = (slug) => {
    const info = getPageAvailability(slug);
    return info && info.status === 'maintenance';
  };

  // Helper: Get Section
  const getSection = (key) => {
    return content.sections?.[key] || DEFAULT_SITE_CONTENT.sections[key] || {};
  };

  // Helper: Get Brand
  const getBrand = () => {
    return content.brand || DEFAULT_SITE_CONTENT.brand;
  };

  // Helper: Get Page Content (for policy & customer care pages)
  const getPageContent = (pageKey) => {
    return content.pages?.[pageKey] || DEFAULT_SITE_CONTENT.pages?.[pageKey] || {};
  };

  // Helper: Get Active Hero Slides
  const getHeroSlides = () => {
    const slides = content.hero_slides || DEFAULT_SITE_CONTENT.hero_slides;
    return slides.filter((s) => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Helper: Get Active Jharokha Categories
  const getJharokhaCategories = () => {
    const cats = content.jharokha_categories || DEFAULT_SITE_CONTENT.jharokha_categories;
    return cats.filter((c) => c.active !== false);
  };

  // Helper: Get Brand Pillars
  const getPillars = () => {
    return content.pillars || DEFAULT_SITE_CONTENT.pillars;
  };

  const value = {
    content,
    loading,
    refreshContent: fetchContent,
    updateContent,
    resetSection,
    getPageAvailability,
    isComingSoon,
    isMaintenance,
    getSection,
    getBrand,
    getPageContent,
    getHeroSlides,
    getJharokhaCategories,
    getPillars
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
