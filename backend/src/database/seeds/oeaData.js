const getOeaData = (ymcaId = 'xyz') => {
  // YMCA data configurations
  const ymcaConfigs = {
    xyz: {
      name: "XYZ YMCA",
      totalPoints: 34,
      maxPoints: 80,
      overallSupportDesignation: "Y-USA Support",
      performanceSnapshot: {
        operationalPerformance: {
          category: "Operational Performance",
          metrics: [
            {
              name: "Membership and Program Growth",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
            },
            {
              name: "Staff Retention",
              points: 0,
              maxPoints: 4,
              performance: "low",
              description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
            },
            {
              name: "Grace Score",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
            },
            {
              name: "Risk Mitigation Score",
              points: 6,
              maxPoints: 8,
              performance: "moderate",
              description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
            },
            {
              name: "Governance Score",
              points: 9,
              maxPoints: 12,
              performance: "moderate",
              description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
            },
            {
              name: "Engagement Score",
              points: 5,
              maxPoints: 8,
              performance: "moderate",
              description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
            }
          ],
          totalPoints: 24,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        },
        financialPerformance: {
          category: "Financial Performance",
          metrics: [
            {
              name: "Months of Liquidity",
              points: 0,
              maxPoints: 12,
              performance: "low",
              description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
            },
            {
              name: "Operating Margin",
              points: 0,
              maxPoints: 12,
              performance: "low",
              description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
            },
            {
              name: "Debt Ratio",
              points: 0,
              maxPoints: 8,
              performance: "low",
              description: "A measurement of the extent to which the Y relies on debt financing"
            },
            {
              name: "Operating Revenue Mix",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "A measurement that reflects the balance of operating revenue streams"
            },
            {
              name: "Charitable Revenue",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
            }
          ],
          totalPoints: 6,
          maxPoints: 40,
          supportDesignation: "Y-USA Support"
        }
      }
    },
    stlouis: {
      name: "St. Louis Y",
      totalPoints: 62,
      maxPoints: 80,
      overallSupportDesignation: "Independent Improvement",
      performanceSnapshot: {
        operationalPerformance: {
          category: "Operational Performance",
          metrics: [
            {
              name: "Membership and Program Growth",
              points: 3,
              maxPoints: 4,
              performance: "high",
              description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
            },
            {
              name: "Staff Retention",
              points: 3,
              maxPoints: 4,
              performance: "high",
              description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
            },
            {
              name: "Grace Score",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
            },
            {
              name: "Risk Mitigation Score",
              points: 7,
              maxPoints: 8,
              performance: "high",
              description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
            },
            {
              name: "Governance Score",
              points: 10,
              maxPoints: 12,
              performance: "moderate",
              description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
            },
            {
              name: "Engagement Score",
              points: 6,
              maxPoints: 8,
              performance: "moderate",
              description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
            }
          ],
          totalPoints: 33,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        },
        financialPerformance: {
          category: "Financial Performance",
          metrics: [
            {
              name: "Months of Liquidity",
              points: 8,
              maxPoints: 12,
              performance: "moderate",
              description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
            },
            {
              name: "Operating Margin",
              points: 9,
              maxPoints: 12,
              performance: "moderate",
              description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
            },
            {
              name: "Debt Ratio",
              points: 6,
              maxPoints: 8,
              performance: "moderate",
              description: "A measurement of the extent to which the Y relies on debt financing"
            },
            {
              name: "Operating Revenue Mix",
              points: 3,
              maxPoints: 4,
              performance: "high",
              description: "A measurement that reflects the balance of operating revenue streams"
            },
            {
              name: "Charitable Revenue",
              points: 3,
              maxPoints: 4,
              performance: "moderate",
              description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
            }
          ],
          totalPoints: 29,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        }
      }
    },
    charlotte: {
      name: "Charlotte Y",
      totalPoints: 48,
      maxPoints: 80,
      overallSupportDesignation: "Independent Improvement",
      performanceSnapshot: {
        operationalPerformance: {
          category: "Operational Performance",
          metrics: [
            {
              name: "Membership and Program Growth",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
            },
            {
              name: "Staff Retention",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
            },
            {
              name: "Grace Score",
              points: 3,
              maxPoints: 4,
              performance: "high",
              description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
            },
            {
              name: "Risk Mitigation Score",
              points: 6,
              maxPoints: 8,
              performance: "moderate",
              description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
            },
            {
              name: "Governance Score",
              points: 9,
              maxPoints: 12,
              performance: "moderate",
              description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
            },
            {
              name: "Engagement Score",
              points: 5,
              maxPoints: 8,
              performance: "moderate",
              description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
            }
          ],
          totalPoints: 27,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        },
        financialPerformance: {
          category: "Financial Performance",
          metrics: [
            {
              name: "Months of Liquidity",
              points: 6,
              maxPoints: 12,
              performance: "moderate",
              description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
            },
            {
              name: "Operating Margin",
              points: 7,
              maxPoints: 12,
              performance: "moderate",
              description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
            },
            {
              name: "Debt Ratio",
              points: 4,
              maxPoints: 8,
              performance: "moderate",
              description: "A measurement of the extent to which the Y relies on debt financing"
            },
            {
              name: "Operating Revenue Mix",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "A measurement that reflects the balance of operating revenue streams"
            },
            {
              name: "Charitable Revenue",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
            }
          ],
          totalPoints: 21,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        }
      }
    },
    la: {
      name: "LA Y",
      totalPoints: 75,
      maxPoints: 80,
      overallSupportDesignation: "Independent Improvement",
      performanceSnapshot: {
        operationalPerformance: {
          category: "Operational Performance",
          metrics: [
            {
              name: "Membership and Program Growth",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
            },
            {
              name: "Staff Retention",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
            },
            {
              name: "Grace Score",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
            },
            {
              name: "Risk Mitigation Score",
              points: 8,
              maxPoints: 8,
              performance: "high",
              description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
            },
            {
              name: "Governance Score",
              points: 12,
              maxPoints: 12,
              performance: "high",
              description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
            },
            {
              name: "Engagement Score",
              points: 7,
              maxPoints: 8,
              performance: "high",
              description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
            }
          ],
          totalPoints: 39,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        },
        financialPerformance: {
          category: "Financial Performance",
          metrics: [
            {
              name: "Months of Liquidity",
              points: 11,
              maxPoints: 12,
              performance: "high",
              description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
            },
            {
              name: "Operating Margin",
              points: 11,
              maxPoints: 12,
              performance: "high",
              description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
            },
            {
              name: "Debt Ratio",
              points: 7,
              maxPoints: 8,
              performance: "high",
              description: "A measurement of the extent to which the Y relies on debt financing"
            },
            {
              name: "Operating Revenue Mix",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "A measurement that reflects the balance of operating revenue streams"
            },
            {
              name: "Charitable Revenue",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
            }
          ],
          totalPoints: 37,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        }
      }
		},
    chicago: {
        name: "Chicago Y",
        totalPoints: 68,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 7,
                maxPoints: 8,
                performance: "high",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 9,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 35,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 5,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "A measurement that reflects the balance of operating revenue streams"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
              }
            ],
            totalPoints: 30,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    miami: {
        name: "Miami Y",
        totalPoints: 41,
        maxPoints: 80,
        overallSupportDesignation: "Y-USA Support",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 1,
                maxPoints: 4,
                performance: "low",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 1,
                maxPoints: 4,
                performance: "low",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 5,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 7,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 3,
                maxPoints: 8,
                performance: "low",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 22,
            maxPoints: 40,
            supportDesignation: "Y-USA Support"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 4,
                maxPoints: 12,
                performance: "low",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 4,
                maxPoints: 12,
                performance: "low",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 3,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the degree of reliance the Y association has on a primary income source"
              },
              {
                name: "Charitable Revenue",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 18,
            maxPoints: 40,
            supportDesignation: "Y-USA Support"
          }
        }
      },
    seattle: {
        name: "Seattle Y",
        totalPoints: 71,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 7,
                maxPoints: 8,
                performance: "high",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 9,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 36,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "A measurement that reflects the balance of operating revenue streams"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 32,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    boston: {
        name: "Boston Y",
        totalPoints: 78,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 8,
                maxPoints: 8,
                performance: "high",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 10,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 7,
                maxPoints: 8,
                performance: "high",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 40,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 10,
                maxPoints: 12,
                performance: "high",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 10,
                maxPoints: 12,
                performance: "high",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 7,
                maxPoints: 8,
                performance: "high",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "A measurement that reflects the balance of operating revenue streams"
              },
              {
                name: "Charitable Revenue",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 35,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    denver: {
        name: "Denver Central YMCA",
        totalPoints: 65,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 7,
                maxPoints: 8,
                performance: "high",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 10,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 32,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "A measurement that reflects the balance of operating revenue streams"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 30,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    buffalo: {
        name: "Buffalo Central YMCA",
        totalPoints: 51,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 5,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 26,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 6,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 6,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 4,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "A measurement that reflects the balance of operating revenue streams"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 22,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    columbus: {
        name: "Columbus YMCA",
        totalPoints: 58,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 7,
                maxPoints: 8,
                performance: "high",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 9,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 5,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 29,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 7,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 5,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "A measurement that reflects the balance of operating revenue streams"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 26,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    cleveland: {
        name: "Cleveland Central YMCA",
        totalPoints: 45,
        maxPoints: 80,
        overallSupportDesignation: "Y-USA Support",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 1,
                maxPoints: 4,
                performance: "low",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 7,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 4,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 22,
            maxPoints: 40,
            supportDesignation: "Y-USA Support"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 4,
                maxPoints: 12,
                performance: "low",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 4,
                maxPoints: 12,
                performance: "low",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 3,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the degree of reliance the Y association has on a primary income source"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 20,
            maxPoints: 40,
            supportDesignation: "Y-USA Support"
          }
        }
      },
    philadelphia: {
        name: "Philadelphia YMCA",
        totalPoints: 73,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 8,
                maxPoints: 8,
                performance: "high",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 11,
                maxPoints: 12,
                performance: "high",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 7,
                maxPoints: 8,
                performance: "high",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 37,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 10,
                maxPoints: 12,
                performance: "high",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 10,
                maxPoints: 12,
                performance: "high",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "Ratio indicates the extent to which the Y association relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 4,
                maxPoints: 4,
                performance: "high",
                description: "Ratio reflects the degree of reliance the Y association has on a primary income source"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 33,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    knoxville: {
        name: "Knoxville YMCA",
        totalPoints: 54,
        maxPoints: 80,
        overallSupportDesignation: "Independent Improvement",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 6,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 8,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 5,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 27,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 6,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 6,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 4,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 3,
                maxPoints: 4,
                performance: "high",
                description: "Ratio reflects the degree of reliance the Y association has on a primary income source"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 24,
            maxPoints: 40,
            supportDesignation: "Independent Improvement"
          }
        }
      },
    tacoma: {
        name: "Tacoma YMCA",
        totalPoints: 47,
        maxPoints: 80,
        overallSupportDesignation: "Y-USA Support",
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: 1,
                maxPoints: 4,
                performance: "low",
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: 5,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: 7,
                maxPoints: 12,
                performance: "moderate",
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: 4,
                maxPoints: 8,
                performance: "moderate",
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: 21,
            maxPoints: 40,
            supportDesignation: "Y-USA Support"
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: 5,
                maxPoints: 12,
                performance: "moderate",
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: 4,
                maxPoints: 12,
                performance: "low",
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: 3,
                maxPoints: 8,
                performance: "moderate",
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: 2,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the degree of reliance the Y association has on a primary income source"
              },
              {
                name: "Charitable Revenue",
                points: 3,
                maxPoints: 4,
                performance: "moderate",
                description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue"
              }
            ],
            totalPoints: 23,
            maxPoints: 40,
            supportDesignation: "Y-USA Support"
          }
        }
      }
  };

  const selectedConfig = ymcaConfigs[ymcaId] || ymcaConfigs.xyz;
  
  // Add suggested resources based on performance
  const suggestedResources = generateSuggestedResources(selectedConfig.performanceSnapshot);
  
  return {
    id: ymcaId,
    name: selectedConfig.name,
    totalPoints: selectedConfig.totalPoints,
    maxPoints: selectedConfig.maxPoints,
    performanceSnapshot: selectedConfig.performanceSnapshot,
    suggestedResources: suggestedResources,
    overallSupportDesignation: selectedConfig.overallSupportDesignation
  };
};

// Generate suggested resources based on performance
function generateSuggestedResources(performanceSnapshot) {
  const resources = {};
  
  // Staff Retention resources (always included for demonstration)
  resources.staffRetention = {
    selfDirected: "Link",
    networkSupported: {
      directDelivery: ["Peer Communities", "Membership SDP", "HR SDP", "Activation Cohorts", "Learning Centers", "Alliances", "Y-USA", "Finance SDP"],
      sharedServices: ["Y-USA", "YESS"]
    },
    highlighted: {
      directDelivery: ["Learning Centers", "HR SDP"],
      sharedServices: ["Y-USA"]
    }
  };
  
  // Financial metrics resources
  resources.financialMetrics = {
    selfDirected: "Link",
    networkSupported: {
      directDelivery: ["Peer Communities", "Membership SDP", "HR SDP", "Activation Cohorts", "Learning Centers", "Alliances", "Y-USA", "Finance SDP"],
      sharedServices: ["Y-USA", "YESS"]
    },
    highlighted: {
      sharedServices: ["Y-USA", "YESS"]
    }
  };
  
  // Add resources for low-performing metrics
  performanceSnapshot.operationalPerformance.metrics.forEach(metric => {
    if (metric.performance === 'low') {
      resources[metric.name.replace(/\s+/g, '')] = {
        selfDirected: "Link",
        networkSupported: {
          directDelivery: ["Peer Communities", "Membership SDP", "HR SDP", "Activation Cohorts", "Learning Centers", "Alliances", "Y-USA", "Finance SDP"],
          sharedServices: ["Y-USA", "YESS"]
        },
        highlighted: {
          directDelivery: ["Learning Centers", "HR SDP"],
          sharedServices: ["Y-USA"]
        }
      };
    }
  });
  
  performanceSnapshot.financialPerformance.metrics.forEach(metric => {
    if (metric.performance === 'low') {
      resources[metric.name.replace(/\s+/g, '')] = {
        selfDirected: "Link",
        networkSupported: {
          directDelivery: ["Peer Communities", "Membership SDP", "HR SDP", "Activation Cohorts", "Learning Centers", "Alliances", "Y-USA", "Finance SDP"],
          sharedServices: ["Y-USA", "YESS"]
        },
        highlighted: {
          sharedServices: ["Y-USA", "YESS"]
        }
      };
    }
  });
  
  return resources;
}

module.exports = { getOeaData }; 