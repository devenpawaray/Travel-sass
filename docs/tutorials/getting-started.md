# Tutorial: Your First Data-to-Quote Lifecycle

Follow these steps to understand how unstructured data becomes controlled financial inventory.

## Step 1: Data Ingestion (The Input)
1. Go to the **Ingestion** module.
2. Select **"Manual Payload"**.
3. Edit the JSON to set a `hotel` name and a `price`.
4. Click **"Commit to Ingestion Pipeline"**.
5. *Result*: A `RAW_IMPORT_CREATED` event is emitted.

## Step 2: Validation Gateway (The Secretary)
1. Navigate to the **Validation** module.
2. You will see your raw data on the left and the AI-parsed structure on the right.
3. Review the data for accuracy.
4. Click **"Authorize"**.
5. *Result*: The data is promoted to **Master Inventory** (`system_state`).

## Step 3: Strategic Quote Engine (The Consultant)
1. Navigate to the **Consultant** module.
2. Select the "System Asset" you just authorized from the list.
3. Review the **Pricing Matrix**. Notice the 12% margin automatically applied based on the Constitution.
4. Click **"Finalize & Issue Quote"**.
5. *Result*: A financial snapshot is created, and the quote is locked.

## Step 4: Verification (The Auditor)
1. Go to the **Admin Control** room to see the event stream.
2. Go to the **Ledger** to see the projected commission.
3. Go to the **Audit** logs to see the full forensic chain of your actions.
