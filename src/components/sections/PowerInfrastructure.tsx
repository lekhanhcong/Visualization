'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Zap, Activity, Building2, Waves } from 'lucide-react'

export default function PowerInfrastructure() {
  const [activePoint, setActivePoint] = useState<string | null>('datacenter')

  const infrastructurePoints = [
    {
      id: 'datacenter',
      name: 'AI Data Center',
      icon: Building2,
      x: '60%',
      y: '45%',
      color: 'from-blue-500 to-cyan-500',
      details: {
        'Power Capacity': '300MW',
        'Total Area': '50 hectares',
        'Cooling System': 'Advanced liquid cooling',
        'Redundancy': 'N+1 power redundancy',
        'IT Load': '250MW dedicated',
        'Efficiency': 'PUE < 1.2'
      }
    },
    {
      id: 'substation',
      name: '500/220KV Substation',
      icon: Zap,
      x: '35%',
      y: '20%',
      color: 'from-red-500 to-orange-500',
      details: {
        'Capacity': '2x600MVA transformers',
        'Voltage Levels': '500/220/110KV',
        'Connection': 'Direct national grid',
        'Reliability': '99.99% uptime',
        'Backup': 'Dual feed design',
        'Smart Grid': 'AI-powered management'
      }
    },
    {
      id: 'hydro',
      name: 'Ta Trach Hydro Plant',
      icon: Waves,
      x: '15%',
      y: '40%',
      color: 'from-green-500 to-emerald-500',
      details: {
        'Capacity': '2x10.5MW turbines',
        'Type': '100% renewable',
        'Distance': '15km direct line',
        'Availability': '24/7 baseload',
        'Carbon Offset': '50,000 tons/year',
        'Water Source': 'Ta Trach River'
      }
    },
    {
      id: 'solar',
      name: 'Solar Farm (Future)',
      icon: Activity,
      x: '75%',
      y: '65%',
      color: 'from-yellow-500 to-amber-500',
      details: {
        'Planned Capacity': '100MW',
        'Technology': 'Bifacial panels',
        'Area': '150 hectares',
        'Completion': '2025 Q4',
        'Annual Output': '180GWh',
        'Storage': '50MWh battery'
      }
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Power Infrastructure Excellence
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Strategic location with redundant power supply from national grid and renewable sources, 
            ensuring 99.99% uptime for mission-critical AI workloads
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-700/50">
              <div className="relative h-[600px] lg:h-[700px]">
                <Image
                  src="/images/power-map.png"
                  alt="Power Infrastructure Map"
                  fill
                  className="object-contain p-8"
                  priority
                />
                
                {/* Interactive Points */}
                {infrastructurePoints.map((point) => (
                  <motion.div
                    key={point.id}
                    className={`absolute cursor-pointer group`}
                    style={{ left: point.x, top: point.y }}
                    onClick={() => setActivePoint(point.id)}
                    whileHover={{ scale: 1.1 }}
                  >
                    {/* Ripple Effect */}
                    <div className={`absolute -inset-4 bg-gradient-to-r ${point.color} rounded-full opacity-20 group-hover:opacity-40 transition-opacity`}>
                      <div className="absolute inset-0 rounded-full animate-ping" />
                    </div>
                    
                    {/* Icon */}
                    <div className={`relative w-12 h-12 bg-gradient-to-r ${point.color} rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110`}>
                      <point.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Label */}
                    <div className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                      {point.name}
                    </div>
                  