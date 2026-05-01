# TRAVEL-SASS Administrator Manual

## 🧠 System Governance Philosophy
The TRAVEL-SASS platform is not a booking tool; it is a **Financial Execution Environment**. As an administrator, your role is to manage the **Constitution** (rules) rather than individual bookings.

## 1. Using the Control Room (Dashboard)
The Dashboard provides a real-time "Commercial Pulse" of your agency.
- **Mission Logs**: Monitor every event as it happens (Imports, Approvals, Quotes).
- **Intelligence Alerts**: Red alerts indicate financial risks (low margins, partner volatility).
- **Kill Switch**: Use the **"Terminate Operations"** button only in emergencies. This will freeze all live quotes and prevent any financial loss during system-wide instability.

## 2. Managing the Constitution (Config)
Navigate to the **Constitution** module to set your agency's financial laws.
- **Commission 2 Rules**: Define minimum profit percentages for Hotels, Flights, and Packages.
- **Risk Thresholds**: Set the maximum allowed price volatility before a record is flagged for high-risk review.
- **Timing Rules**: Set how long a quote remains legally binding before it must be re-priced.

## 3. The Audit Trail
Every action in the system is logged immutably.
- Navigate to **Ledger** for a financial summary of all verified transactions.
- Navigate to **Audit** for a forensic breakdown of every event and state transition.

## 🚨 Emergency Protocols
In case of a detected partner data corruption:
1. Trigger the **Kill Switch**.
2. Review the **Validation Gateway** to identify the source.
3. Update the **Constitution** to increase risk thresholds for the affected partner.
4. Deactivate the Kill Switch once the "Pulse" returns to Green.
