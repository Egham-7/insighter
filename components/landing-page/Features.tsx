import type React from "react";
import {
  BarChart3,
  TrendingUp,
  ScissorsLineDashed,
  BrainCircuit,
  Zap,
  PieChart,
} from "lucide-react";

const Features: React.FC = () => {
  return (
    <section className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl xl:text-5xl font-pj">
            AI-Powered Business Intelligence for SMEs
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-8 font-pj">
            Boost your revenue and cut costs with our advanced AI analysis tools
          </p>
        </div>

        <div className="grid grid-cols-1 mt-10 text-center sm:mt-16 sm:grid-cols-2 sm:gap-x-12 gap-y-12 md:grid-cols-3 md:gap-0 xl:mt-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`md:p-8 lg:p-14 ${
                index > 0 && index % 3 !== 0
                  ? "md:border-l md:border-gray-200"
                  : ""
              } ${index > 2 ? "md:border-t md:border-gray-200" : ""}`}
            >
              <feature.icon className="w-12 h-12 mx-auto text-blue-600" />
              <h3 className="mt-12 text-xl font-bold text-gray-900 font-pj">
                {feature.title}
              </h3>
              <p className="mt-5 text-base text-gray-600 font-pj">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const features = [
  {
    icon: BarChart3,
    title: "Revenue Analysis",
    description:
      "Our AI analyzes your sales data to identify trends and opportunities for revenue growth, providing actionable insights to boost your bottom line.",
  },
  {
    icon: ScissorsLineDashed,
    title: "Cost Optimization",
    description:
      "Leverage AI to scrutinize your expenses, identifying areas for cost-cutting and efficiency improvements without sacrificing quality.",
  },
  {
    icon: BrainCircuit,
    title: "Predictive Analytics",
    description:
      "Harness the power of machine learning to forecast market trends, customer behavior, and potential risks, allowing you to stay ahead of the curve.",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description:
      "Monitor your key performance indicators in real-time, with AI-driven alerts and recommendations to keep your business on track.",
  },
  {
    icon: Zap,
    title: "Automated Insights",
    description:
      "Receive daily or weekly AI-generated reports highlighting critical business insights, saving you time and ensuring you never miss important trends.",
  },
  {
    icon: PieChart,
    title: "Custom Dashboards",
    description:
      "Create personalized, interactive dashboards that give you a 360-degree view of your business performance, tailored to your specific needs.",
  },
];

export default Features;
