# Animation Monitoring and Analytics Setup

## Real-Time Performance Monitoring

### Core Metrics Collection

```typescript
// lib/animation-telemetry.ts
export interface AnimationMetrics {
  sessionId: string;
  animationId: string;
  startTime: number;
  endTime: number;
  duration: number;
  fps: number[];
  memoryUsage: number[];
  droppedFrames: number;
  errorCount: number;
  userAgent: string;
  viewport: { width: number; height: number };
  networkSpeed: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

class AnimationTelemetry {
  private metrics: Map<string, AnimationMetrics> = new Map();
  private collectors: MetricCollector[] = [];

  startTracking(animationId: string): void {
    const metrics: AnimationMetrics = {
      sessionId: this.generateSessionId(),
      animationId,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      fps: [],
      memoryUsage: [],
      droppedFrames: 0,
      errorCount: 0,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      networkSpeed: this.getNetworkSpeed(),
      deviceType: this.getDeviceType()
    };

    this.metrics.set(animationId, metrics);
    this.startCollectors(animationId);
  }

  private startCollectors(animationId: string): void {
    // FPS collector
    this.collectors.push(new FPSCollector(animationId, this.metrics));
    
    // Memory collector
    this.collectors.push(new MemoryCollector(animationId, this.metrics));
    
    // Performance observer
    this.collectors.push(new PerformanceCollector(animationId, this.metrics));
  }

  stopTracking(animationId: string): AnimationMetrics | undefined {
    const metrics = this.metrics.get(animationId);
    if (metrics) {
      metrics.endTime = performance.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      
      // Stop all collectors
      this.collectors.forEach(collector => collector.stop());
      this.collectors = [];
      
      // Send to analytics
      this.sendToAnalytics(metrics);
      
      return metrics;
    }
  }

  private sendToAnalytics(metrics: AnimationMetrics): void {
    // Send to multiple analytics services
    this.sendToGoogleAnalytics(metrics);
    this.sendToCustomAnalytics(metrics);
    this.sendToSentry(metrics);
  }
}
```

### Performance Observers

```typescript
// lib/performance-observers.ts
class FPSCollector {
  private animationFrame: number = 0;
  private lastFrameTime = 0;
  
  constructor(
    private animationId: string,
    private metrics: Map<string, AnimationMetrics>
  ) {
    this.startCollection();
  }

  private startCollection(): void {
    const measureFPS = (currentTime: number) => {
      if (this.lastFrameTime) {
        const delta = currentTime - this.lastFrameTime;
        const fps = 1000 / delta;
        
        const animationMetrics = this.metrics.get(this.animationId);
        if (animationMetrics) {
          animationMetrics.fps.push(fps);
          
          if (delta > 16.67) { // Dropped frame at 60fps
            animationMetrics.droppedFrames++;
          }
        }
      }
      
      this.lastFrameTime = currentTime;
      this.animationFrame = requestAnimationFrame(measureFPS);
    };
    
    this.animationFrame = requestAnimationFrame(measureFPS);
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

class MemoryCollector {
  private interval: NodeJS.Timeout;
  
  constructor(
    private animationId: string,
    private metrics: Map<string, AnimationMetrics>
  ) {
    this.startCollection();
  }

  private startCollection(): void {
    this.interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryMB = memory.usedJSHeapSize / (1024 * 1024);
        
        const animationMetrics = this.metrics.get(this.animationId);
        if (animationMetrics) {
          animationMetrics.memoryUsage.push(memoryMB);
        }
      }
    }, 100); // Collect every 100ms
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
```

### Error Tracking and Alerting

```typescript
// lib/error-tracking.ts
class AnimationErrorTracker {
  private static instance: AnimationErrorTracker;
  private errorCounts = new Map<string, number>();
  private alertThresholds = {
    errorRate: 0.05, // 5%
    memoryLeak: 50, // 50MB increase
    lowFPS: 30, // Below 30 FPS
    highLatency: 5000 // Above 5 seconds
  };

  static getInstance(): AnimationErrorTracker {
    if (!this.instance) {
      this.instance = new AnimationErrorTracker();
    }
    return this.instance;
  }

  trackError(animationId: string, error: Error, context: any): void {
    const errorKey = `${animationId}:${error.name}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);

    // Send to error tracking service
    this.sendToSentry({
      animationId,
      error,
      context,
      errorCount: currentCount + 1,
      timestamp: Date.now()
    });

    // Check alert thresholds
    this.checkAlertThresholds(animationId, error, context);
  }

  private checkAlertThresholds(animationId: string, error: Error, context: any): void {
    const metrics = context.metrics as AnimationMetrics;
    
    // Check error rate
    const totalAnimations = this.getTotalAnimations();
    const errorRate = this.getTotalErrors() / totalAnimations;
    
    if (errorRate > this.alertThresholds.errorRate) {
      this.sendAlert('HIGH_ERROR_RATE', {
        rate: errorRate,
        threshold: this.alertThresholds.errorRate,
        animationId
      });
    }

    // Check memory usage
    if (metrics && metrics.memoryUsage.length > 0) {
      const maxMemory = Math.max(...metrics.memoryUsage);
      const minMemory = Math.min(...metrics.memoryUsage);
      const memoryIncrease = maxMemory - minMemory;
      
      if (memoryIncrease > this.alertThresholds.memoryLeak) {
        this.sendAlert('MEMORY_LEAK_DETECTED', {
          increase: memoryIncrease,
          threshold: this.alertThresholds.memoryLeak,
          animationId
        });
      }
    }

    // Check FPS performance
    if (metrics && metrics.fps.length > 0) {
      const avgFPS = metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length;
      
      if (avgFPS < this.alertThresholds.lowFPS) {
        this.sendAlert('LOW_FPS_DETECTED', {
          fps: avgFPS,
          threshold: this.alertThresholds.lowFPS,
          animationId
        });
      }
    }
  }

  private sendAlert(type: string, data: any): void {
    // Send to monitoring services
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        severity: this.getAlertSeverity(type)
      })
    });

    // Send to Slack/Teams
    this.sendToSlack(type, data);
  }
}
```

### Analytics Dashboard Integration

```typescript
// lib/analytics-integration.ts
class AnimationAnalytics {
  private providers: AnalyticsProvider[] = [];

  constructor() {
    this.setupProviders();
  }

  private setupProviders(): void {
    // Google Analytics 4
    this.providers.push(new GoogleAnalyticsProvider());
    
    // Custom analytics
    this.providers.push(new CustomAnalyticsProvider());
    
    // Amplitude
    this.providers.push(new AmplitudeProvider());
  }

  trackAnimationEvent(event: string, properties: any): void {
    this.providers.forEach(provider => {
      provider.track(event, {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: this.getUserId()
      });
    });
  }

  trackPerformanceMetrics(metrics: AnimationMetrics): void {
    const performanceData = {
      animation_id: metrics.animationId,
      duration: metrics.duration,
      avg_fps: metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length,
      dropped_frames: metrics.droppedFrames,
      max_memory: Math.max(...metrics.memoryUsage),
      device_type: metrics.deviceType,
      viewport_width: metrics.viewport.width,
      viewport_height: metrics.viewport.height,
      network_speed: metrics.networkSpeed
    };

    this.trackAnimationEvent('animation_performance', performanceData);
  }

  generatePerformanceReport(): Promise<PerformanceReport> {
    return fetch('/api/analytics/performance-report')
      .then(response => response.json());
  }
}

interface PerformanceReport {
  summary: {
    totalAnimations: number;
    averageFPS: number;
    errorRate: number;
    completionRate: number;
  };
  trends: {
    fpsOverTime: Array<{ timestamp: number; value: number }>;
    memoryOverTime: Array<{ timestamp: number; value: number }>;
    errorRateOverTime: Array<{ timestamp: number; value: number }>;
  };
  browserBreakdown: Record<string, PerformanceMetrics>;
  deviceBreakdown: Record<string, PerformanceMetrics>;
}
```

### Automated Monitoring Scripts

```bash
#!/bin/bash
# scripts/monitor-animation-health.sh

# Check animation error rate
ERROR_RATE=$(curl -s "http://localhost:3000/api/metrics/error-rate" | jq '.rate')
if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
    echo "ALERT: High animation error rate: $ERROR_RATE"
    curl -X POST "$SLACK_WEBHOOK" -d "{\"text\":\"🚨 Animation error rate above threshold: $ERROR_RATE\"}"
fi

# Check average FPS
AVG_FPS=$(curl -s "http://localhost:3000/api/metrics/average-fps" | jq '.fps')
if (( $(echo "$AVG_FPS < 30" | bc -l) )); then
    echo "ALERT: Low animation FPS: $AVG_FPS"
    curl -X POST "$SLACK_WEBHOOK" -d "{\"text\":\"⚠️ Animation FPS below threshold: $AVG_FPS\"}"
fi

# Check memory usage
MEMORY_USAGE=$(curl -s "http://localhost:3000/api/metrics/memory-usage" | jq '.memory')
if (( $(echo "$MEMORY_USAGE > 100" | bc -l) )); then
    echo "ALERT: High memory usage: $MEMORY_USAGE MB"
    curl -X POST "$SLACK_WEBHOOK" -d "{\"text\":\"💾 High animation memory usage: $MEMORY_USAGE MB\"}"
fi

# Check animation completion rate
COMPLETION_RATE=$(curl -s "http://localhost:3000/api/metrics/completion-rate" | jq '.rate')
if (( $(echo "$COMPLETION_RATE < 0.95" | bc -l) )); then
    echo "ALERT: Low animation completion rate: $COMPLETION_RATE"
    curl -X POST "$SLACK_WEBHOOK" -d "{\"text\":\"📉 Low animation completion rate: $COMPLETION_RATE\"}"
fi
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Animation Performance Dashboard",
    "panels": [
      {
        "title": "Animation FPS",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(animation_fps)",
            "legendFormat": "Average FPS"
          }
        ],
        "thresholds": [
          {
            "value": 30,
            "colorMode": "critical",
            "op": "lt"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph", 
        "targets": [
          {
            "expr": "max(animation_memory_mb)",
            "legendFormat": "Peak Memory (MB)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(animation_errors_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      },
      {
        "title": "Animation Completion Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "animation_completions / animation_starts",
            "legendFormat": "Completion Rate"
          }
        ]
      }
    ]
  }
}
```

### API Endpoints for Metrics

```typescript
// pages/api/metrics/[metric].ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { metric } = req.query;

  switch (metric) {
    case 'error-rate':
      const errorRate = await getAnimationErrorRate();
      res.json({ rate: errorRate });
      break;
      
    case 'average-fps':
      const avgFPS = await getAverageAnimationFPS();
      res.json({ fps: avgFPS });
      break;
      
    case 'memory-usage':
      const memoryUsage = await getAnimationMemoryUsage();
      res.json({ memory: memoryUsage });
      break;
      
    case 'completion-rate':
      const completionRate = await getAnimationCompletionRate();
      res.json({ rate: completionRate });
      break;
      
    default:
      res.status(404).json({ error: 'Metric not found' });
  }
}
```

This monitoring setup provides comprehensive visibility into animation performance, enabling proactive issue detection and resolution.