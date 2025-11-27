# 💾 Data Persistence - Enabled!

## ✅ Your Data is Now Saved

Your schema data is **automatically saved to browser localStorage** and will persist across page refreshes!

## What Gets Saved

Everything you create is saved automatically:
- ✅ All tables (names, colors, positions)
- ✅ All columns (names, types, constraints)
- ✅ All relationships
- ✅ Selected state
- ✅ Connect mode state

## How It Works

### Automatic Saving:
- Every change you make is **instantly saved** to localStorage
- No "Save" button needed
- Works in the background

### Automatic Loading:
- When you refresh the page, your data **automatically loads**
- Same tables, same columns, same relationships
- Continue right where you left off!

## 🔄 Storage Location

**Browser localStorage** (`visubase-storage` key)
- Stored locally in your browser
- Not shared between devices
- Not lost when you close the browser
- Survives page refreshes

## 🧹 Reset All Data

If you want to start fresh:

1. Click **"🔄 Reset All"** button (top right of Schema Editor)
2. Confirm the action
3. Page reloads with default data:
   - Box 1, Box 2, Box 3
   - No columns
   - No relationships

**Warning**: This deletes ALL your work and cannot be undone!

## 💡 Best Practices

### During Development:
1. Design tables and columns
2. Create relationships
3. Refresh page anytime - data persists!
4. Click "Sync & Create Tables" when ready

### For Backups:
1. Click **"📦 Export JSON"** periodically
2. Save the file as backup
3. If needed, you can manually import later

### For Production:
1. Design your schema locally (persists in browser)
2. Click **"☁️ Sync & Create Tables"**
3. Real tables created in Supabase
4. Both browser and Supabase have your schema

## 🔍 What's Stored

```javascript
// In localStorage under "visubase-storage"
{
  "state": {
    "tables": [
      {
        "id": "cuboid1",
        "name": "Users",
        "color": "#EFF7F6",
        "position": [-5, 0, 0],
        "columns": [
          {
            "name": "id",
            "type": "serial",
            "primaryKey": true,
            "nullable": false,
            "unique": false
          },
          // ... more columns
        ]
      }
      // ... more tables
    ],
    "relationships": [
      { "from": "cuboid1", "to": "cuboid2" }
    ],
    "selected": null,
    "connectMode": null
  },
  "version": 0
}
```

## 🌐 Browser Scope

**Important**: Data is stored per browser/device

- Chrome → Has its own storage
- Firefox → Has its own storage
- Different computer → Starts fresh
- Incognito mode → Separate storage (cleared on close)

## 📊 Storage Limits

localStorage has a limit (~5-10MB per domain):
- Your schema data is tiny (usually < 50KB)
- Can store hundreds of tables easily
- No practical limit for normal use

## 🔐 Privacy & Security

- Data stored **locally in your browser**
- Never sent to any server (except when you click "Sync to Supabase")
- Private to your browser profile
- Not accessible by other websites

## 🚀 Advanced: Manual Storage Access

### View Stored Data:
```javascript
// In browser console (F12)
JSON.parse(localStorage.getItem('visubase-storage'))
```

### Clear Data Manually:
```javascript
// In browser console (F12)
localStorage.removeItem('visubase-storage')
location.reload()
```

### Export Data:
```javascript
// In browser console (F12)
const data = localStorage.getItem('visubase-storage');
console.log(data);
// Copy and save to file
```

## ⚠️ Important Notes

### Data Loss Scenarios:
- ❌ Clearing browser data/cache
- ❌ Using "Clear browsing data" in browser settings
- ❌ Clicking "Reset All" button
- ❌ Uninstalling/reinstalling browser
- ❌ Different browser/device

### Data Persists When:
- ✅ Closing and reopening browser
- ✅ Refreshing the page
- ✅ Shutting down computer
- ✅ Coming back days later
- ✅ Opening in new tab (same browser)

## 🎯 Workflow Recommendations

### Option 1: LocalStorage as Primary (Current)
```
Design → Auto-saves to browser
Refresh → Data loads automatically
Sync → Creates tables in Supabase when ready
```

### Option 2: Supabase as Primary
```
Design → Click "Sync" frequently
Refresh → Manual reload from Supabase if needed
Export → Backup as JSON/SQL
```

### Option 3: Hybrid (Recommended)
```
Design → Auto-saves locally
Major milestone → Sync to Supabase
Export → Backup as files periodically
```

## 🐛 Troubleshooting

### Data not persisting:
- Check if localStorage is enabled in browser
- Not in Incognito/Private mode
- Browser has storage space available
- No browser extensions blocking storage

### Data corrupted:
- Click "Reset All" to start fresh
- Check browser console for errors (F12)
- Export JSON before resetting

### Lost data after clearing cache:
- Unfortunately, this deletes localStorage
- Keep JSON backups
- Sync to Supabase regularly

---

**Your data now persists! Design with confidence.** 🎉
