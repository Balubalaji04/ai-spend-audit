# Economics

SpendScope works economically because the product is cheap to distribute and the downstream Credex deal value is high. A converted lead is not just an email address; it is a company that has already entered its AI stack, seen a savings number, and indicated interest in reducing AI infrastructure cost.

Credex’s average AI credit deal is assumed to be $5,000 in contract value. If Credex earns a 25-30% gross margin on resold credits, contribution per deal is:

| Contract Value | Gross Margin | Contribution |
| --- | ---: | ---: |
| $5,000 | 25% | $5,000 × 0.25 = $1,250 |
| $5,000 | 30% | $5,000 × 0.30 = $1,500 |

So one converted customer is worth roughly $1,250-$1,500 in gross contribution before fixed costs. If 40% of customers renew twice per year, expected renewal value is meaningful. The base deal contributes $1,250. Renewal contribution is `40% × 2 renewals × $1,250 = $1,000`. That makes conservative first-year LTV `base $1,250 + renewal $1,000 = $2,250`. At the high margin case, LTV is `$1,500 + (40% × 2 × $1,500) = $2,700`.

Customer acquisition cost depends heavily on channel. The strongest channel is Credex’s existing network because those companies already care about discounted AI spend.

| Channel | Cost | Leads | CAC |
| --- | ---: | ---: | ---: |
| Slack/community post | 2 hours × $30/hr = $60 | 5 leads | $60 / 5 = $12 |
| Product Hunt launch | 1 day × $30/hr × 8 = $240 | 15 leads | $240 / 15 = $16 |
| Credex customer email | Existing list + 1 hour setup = $30 | 25 leads | $30 / 25 = $1.20 |
| Founder DM outreach | 5 hours × $30/hr = $150 | 12 leads | $150 / 12 = $12.50 |

A realistic funnel from 1,000 visitors looks like this:

| Step | Conversion | Count |
| --- | ---: | ---: |
| Visitors | 100% | 1,000 |
| Audit started | 60% | 600 |
| Audit completed | 70% | 420 |
| Email captured | 20% | 84 |
| Consultation booked | 15% | 13 |
| Credit purchase | 25% | 3 customers |

The 60% start rate is realistic because the homepage value is direct: find wasted AI spend. The 70% completion rate assumes the form stays short and does not require login. A 20% email capture rate is plausible because users see a personalized savings result before being asked for contact info. A 15% consultation rate is reasonable for savings-aware leads, and a 25% close rate fits a warm, problem-qualified sales conversation.

To reach $1M ARR, Credex needs `$1,000,000 / $5,000 ACV = 200 customers`. Over 18 months, that means `200 / 18 = 11.1`, or about 11 new customers per month. With a 25% consultation-to-purchase rate, 11 customers require `11 / 0.25 = 44 consultations`. With a 15% email-to-consultation rate, that requires `44 / 0.15 = 294 emails`. With a 20% email capture rate, that requires `294 / 0.20 = 1,470 completed audits`. With a 70% completion rate, that requires `1,470 / 0.70 = 2,100 audit starts`. With a 60% visitor-to-start rate, that requires `2,100 / 0.60 = 3,500 visitors per month`.

That traffic target is realistic if Credex combines its unfair channel with public sharing. Many small Product Hunt launches drive a few hundred to a few thousand visits in the first week; 3,500 monthly visitors is not viral-scale traffic. It is achievable through one successful launch, ongoing founder community posts, shared audit result pages, and Credex email distribution.

The break-even case is even clearer. If Credex spends 40 engineering hours building the tool at $100/hour, build cost is `40 × $100 = $4,000`. If each converted customer contributes $1,250, break-even is `$4,000 / $1,250 = 3.2 customers`. In practice, four customers pay for the entire build. After that, every additional customer creates contribution margin from an asset Credex can keep reusing.
