const getMetricsData = () => {
  return {
    existingCommonMetrics: {
      category: "Existing Common Metrics",
      ceiMetrics: {
        name: "CEI Metrics",
        metrics: [
          {
            name: "Grace Score",
            description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
          },
          {
            name: "Membership and Program Growth",
            description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
          },
          {
            name: "Member Diversity Index",
            description: "Measures diversity within membership"
          },
          {
            name: "Board Diversity Index",
            description: "Measures diversity within board composition"
          }
        ]
      }
    },
    organizationalHealthAssessment: {
      category: "Organizational Health Assessment",
      operationalPerformance: {
        name: "Operational Performance",
        metrics: [
          {
            name: "Membership and Program Growth",
            description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share",
            calculation: "(Current Members - Prior Year Members) + Prior Year Members – Demographic Growth of Service Area",
            scoring: {
              "0-33%": "0 pts (Bottom third)",
              "34-66%": "2 pts (Middle third)", 
              "67-100%": "4 pts (Top third)"
            }
          },
          {
            name: "Staff Retention",
            description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year",
            calculation: "(Total Count of Full Time Employees (Beginning of year) – Total Count of Full Time Employees who left (during the year)) ÷ Total Count of Individual Full Time Staff Members (beginning of the year)",
            scoring: {
              ">20%": "0 pts",
              "10% - 20%": "2 pts",
              "<10%": "4 pts"
            }
          },
          {
            name: "Grace Score",
            description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations",
            calculation: "Calculated in Grace Metrics Dashboard",
            scoring: {
              "Not at all engaged (0-3 pts)": "0 pts",
              "Engaged with room for improvement or Not very engaged (4-13 pts)": "2 pts",
              "Very engaged (14-18 pts)": "4 pts"
            }
          },
          {
            name: "Risk Mitigation Score",
            description: "Measures the risk management practices at the Y association",
            maxPoints: 8,
            subMetrics: [
              {
                name: "Child Protection",
                maxPoints: 2,
                subMetrics: [
                  { name: "Implements all components of the Child Protection Membership Qualification", points: 0.5 },
                  { name: "Shares results of self-assessment and action plan with the Board", points: 0.5 },
                  { name: "Y has a staff member with Certified Praesidium Guardian certification", points: 0.5 },
                  { name: "Y achieves Praesidium accreditation", points: 0.5 }
                ]
              },
              {
                name: "Aquatic Safety",
                maxPoints: 2,
                subMetrics: [
                  { name: "Meets all components of the Aquatic Safety Membership Qualification", points: 0.5 },
                  { name: "Conducts a self-assessment of all aquatic facilities every two years", points: 0.5 },
                  { name: "Engages third-party experts to evaluate execution of aquatic safety practices", points: 0.5 },
                  { name: "Educates members and the community on aquatic safety practices", points: 0.5 }
                ]
              },
              {
                name: "IP/Trademark/Brand Reputational Risk",
                maxPoints: 2,
                subMetrics: [
                  { name: "Adhere to all trademark/IP standards and complies with brand standards", points: 0.5 },
                  { name: "Attend a Y-USA led biannual IP/Brand Standards educational training session", points: 0.5 },
                  { name: "Utilize electronic sublicense agreement tool with third-party partners", points: 0.5 },
                  { name: "Engage with Y-USA's office of General Counsel for logo/trademarks use", points: 0.5 }
                ]
              },
              {
                name: "Risk Management Framework",
                maxPoints: 2,
                subMetrics: [
                  { name: "Completed preliminary risk assessment within the last 3 years", points: 0.5 },
                  { name: "Developed and prioritized ongoing risk mitigation efforts", points: 0.5 },
                  { name: "Implemented risk action plan with ongoing monitoring and review", points: 0.5 },
                  { name: "Implemented Enterprise Risk Management process", points: 0.5 }
                ]
              }
            ]
          },
          {
            name: "Governance Score",
            description: "Measures the governance practices at the Y association",
            maxPoints: 12,
            subMetrics: [
              {
                name: "Strategic Planning",
                maxPoints: 3,
                subMetrics: [
                  { name: "The board and staff are strategic partners", points: 0.75 },
                  { name: "Develop organizational strategic plan within the last 3 years", points: 0.75 },
                  { name: "Staff create and have board approval of actionable tactics", points: 0.75 },
                  { name: "Board and staff engage community stakeholders strategically", points: 0.75 }
                ]
              },
              {
                name: "Board Responsibilities",
                maxPoints: 3,
                subMetrics: [
                  { name: "Ensure association is compliant with all applicable governance qualifications", points: 0.75 },
                  { name: "Board in partnership with CEO develop annual goals and appraise annually", points: 0.75 },
                  { name: "Review board bylaws and adjust within the past 3 years", points: 0.75 },
                  { name: "Disseminate accurate information to internal and external stakeholders", points: 0.75 }
                ]
              },
              {
                name: "Board Effectiveness",
                maxPoints: 3,
                subMetrics: [
                  { name: "Review and approve annual budget aligned with strategic plan", points: 0.75 },
                  { name: "Review and approve policies for financial oversight", points: 0.75 },
                  { name: "Board is reflective of community and measures inclusion efforts", points: 0.75 },
                  { name: "Conduct Governing Board Assessment every three years", points: 0.75 }
                ]
              },
              {
                name: "Functional Roles",
                maxPoints: 3,
                subMetrics: [
                  { name: "Oversee financial health by Board finance committee", points: 0.75 },
                  { name: "Oversee risk mitigation practices by Board compliance committee", points: 0.75 },
                  { name: "Oversee fundraising and community relations by Board development committee", points: 0.75 },
                  { name: "Self-evaluate Board performance against established roles and responsibilities", points: 0.75 }
                ]
              }
            ]
          },
          {
            name: "Engagement Score",
            description: "Measures the organizational practices at the Y association",
            maxPoints: 8,
            subMetrics: [
              {
                name: "Member Engagement",
                maxPoints: 2,
                subMetrics: [
                  { name: "Institute systems for best-in-class member experience", points: 0.5 },
                  { name: "Institute Membership Data & Insights Strategy", points: 0.5 },
                  { name: "Conduct value, pricing, and business model assessment", points: 0.5 },
                  { name: "Engage with local partners and third-party payors", points: 0.5 }
                ]
              },
              {
                name: "Staff Engagement",
                maxPoints: 2,
                subMetrics: [
                  { name: "Conduct staff satisfaction survey annually", points: 0.5 },
                  { name: "Develop plans for improvement based on staff feedback", points: 0.5 },
                  { name: "Provide continued education and training programs", points: 0.5 },
                  { name: "Conduct annual 360-degree performance reviews", points: 0.5 }
                ]
              },
              {
                name: "Volunteer Engagement",
                maxPoints: 2,
                subMetrics: [
                  { name: "Conduct volunteer satisfaction survey within past 3 years", points: 0.5 },
                  { name: "Develop plans for improvement based on volunteer feedback", points: 0.5 },
                  { name: "Provide onboarding and training opportunities", points: 0.5 },
                  { name: "Spotlight volunteers who demonstrate exceptional behavior", points: 0.5 }
                ]
              },
              {
                name: "Community Engagement",
                maxPoints: 2,
                subMetrics: [
                  { name: "Generate Community Benefit fact sheet annually", points: 0.5 },
                  { name: "Local Y leadership actively engages in advocacy", points: 0.5 },
                  { name: "Support annual fundraising program tied to cases of support", points: 0.5 },
                  { name: "Partner with strategic community organizations", points: 0.5 }
                ]
              }
            ]
          }
        ]
      },
      financialPerformance: {
        name: "Financial Performance",
        metrics: [
          {
            name: "Months of Liquidity",
            description: "A measurement of how many months of cash a Y has in relation to its monthly expenses",
            calculation: "(Cash and Cash Equivalents + Short Term Investments) ÷ (Total Expenses ÷ 12)",
            scoring: {
              "<1.5": "0 pts",
              "1.5 - 3": "6 pts",
              ">3": "12 pts"
            }
          },
          {
            name: "Operating Margin",
            description: "A measurement of the percentage an association's operating revenues exceed its operating expenses",
            calculation: "(Operating Revenue - Operating Expenses) ÷ Operating Revenue",
            scoring: {
              "<2.7%": "0 pts",
              "2.7% - 3.0%": "6 pts",
              ">3%": "12 pts"
            }
          },
          {
            name: "Debt Ratio",
            description: "A measurement of the extent to which the Y relies on debt financing",
            calculation: "Total Debt ÷ Unrestricted Net Assets",
            scoring: {
              "<22.5%": "0 pts",
              "22.5% - 27%": "4 pts",
              ">27%": "8 pts"
            }
          },
          {
            name: "Operating Revenue Mix",
            description: "A measurement that reflects the balance of operating revenue streams",
            calculation: "|(Program Revenue ÷ Total Operating Revenue) - (Membership Revenue ÷ Total Operating Revenue)|",
            scoring: {
              ">40%": "0 pts",
              "20% - 40%": "2 pts",
              "<20%": "4 pts"
            }
          },
          {
            name: "Charitable Revenue",
            description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue",
            calculation: "Charitable Revenue ÷ Operating Revenue",
            scoring: {
              "<9.8%": "0 pts",
              "9.8% - 15%": "2 pts",
              ">15%": "4 pts"
            }
          }
        ]
      }
    },
    updatedOrganizationalHealthAssessment: {
      category: "Updated Organizational Health Assessment",
      operationalPerformance: {
        name: "Operational Performance",
        metrics: [
          {
            name: "Membership and Program Growth",
            weighting: "4x",
            description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
          },
          {
            name: "Staff Retention",
            weighting: "4x",
            description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
          },
          {
            name: "Grace Score",
            weighting: "4x",
            description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
          },
          {
            name: "Risk Mitigation Score",
            weighting: "8x",
            description: "Measures the risk management practices at the Y association"
          },
          {
            name: "Governance Score",
            weighting: "12x",
            description: "Measures the governance practices at the Y association"
          },
          {
            name: "Engagement Score",
            weighting: "8x",
            description: "Measures the organizational practices at the Y association"
          }
        ]
      },
      financialPerformance: {
        name: "Financial Performance",
        metrics: [
          {
            name: "Months of Liquidity",
            weighting: "12x",
            description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
          },
          {
            name: "Operating Margin",
            weighting: "12x",
            description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
          },
          {
            name: "Debt Ratio",
            weighting: "8x",
            description: "A measurement of the extent to which the Y relies on debt financing"
          },
          {
            name: "Operating Revenue Mix",
            weighting: "4x",
            description: "A measurement that reflects the balance of operating revenue streams"
          },
          {
            name: "Charitable Revenue",
            weighting: "4x",
            description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
          }
        ]
      }
    },
    operationalExcellenceMetrics: {
      category: "Operational Excellence Metrics",
      metrics: [
        {
          name: "Months of Liquidity",
          description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
        },
        {
          name: "Operating Margin",
          description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
        },
        {
          name: "Debt Ratio",
          description: "A measurement of the extent to which the Y relies on debt financing"
        },
        {
          name: "Operating Revenue Mix",
          description: "A measurement that reflects the balance of operating revenue streams"
        },
        {
          name: "Charitable Revenue",
          description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
        }
      ]
    },
    pointsSummary: {
      category: "Points Available",
      summary: {
        "Operational Metrics": "40 points",
        "Financial Metrics": "40 points", 
        "Total Possible": "80 points"
      }
    }
  };
};

module.exports = { getMetricsData }; 