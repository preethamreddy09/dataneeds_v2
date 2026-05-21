// Badge color mapping
const badgeClass = {
  'India': 'india',
  'World': 'world',
  'Ancient': 'ancient',
  'Global': 'global'
};

// Load datasets and build the page
fetch('data/datasets.json')
  .then(function(res) { return res.json(); })
  .then(function(datasets) {
    buildStats(datasets);
    buildDatasetCards(datasets);
    buildSampleTabs(datasets);
    buildContactDropdown(datasets);
  })
  .catch(function(err) {
    console.error('Could not load datasets.json:', err);
  });

// ── Stats ──
function buildStats(datasets) {
  var el = document.getElementById('stat-sources');
  if (el) el.textContent = datasets.length;
}

// ── Dataset cards grouped by category ──
function buildDatasetCards(datasets) {
  var container = document.getElementById('category-container');
  if (!container) return;

  // Group by category
  var categories = {};
  datasets.forEach(function(ds) {
    if (!categories[ds.category]) categories[ds.category] = [];
    categories[ds.category].push(ds);
  });

  Object.keys(categories).forEach(function(cat) {
    var section = document.createElement('div');
    section.className = 'category-section';

    var heading = document.createElement('h3');
    heading.className = 'category-heading';
    heading.textContent = cat;
    section.appendChild(heading);

    var grid = document.createElement('div');
    grid.className = 'ds-grid';

    categories[cat].forEach(function(ds) {
      var card = document.createElement('a');
      card.className = 'ds-card';
      card.href = '#samples';
      card.dataset.tab = ds.id;

      var isComingSoon = !ds.sample_file;

      card.innerHTML = `
        <div class="ds-head">
          <span class="ds-name">${ds.name}</span>
          <span class="ds-badge ${badgeClass[ds.badge] || 'world'}">${ds.badge}</span>
        </div>
        <p class="ds-desc">${ds.description}</p>
        <div class="ds-meta">
          <span>${ds.record_count} records</span>
          <span>${isComingSoon ? 'Coming soon' : ds.formats}</span>
        </div>
      `;

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });

  // Click handler for cards
  document.querySelectorAll('.ds-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      var tabId = this.dataset.tab;
      activateTab(tabId);
      document.getElementById('samples').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ── Sample tabs ──
function buildSampleTabs(datasets) {
  var tabsContainer = document.getElementById('tabs-container');
  var tablesContainer = document.getElementById('tables-container');
  if (!tabsContainer || !tablesContainer) return;

  var first = true;

  datasets.forEach(function(ds) {
    // Tab button
    var btn = document.createElement('button');
    btn.className = 'tab' + (first ? ' active' : '');
    btn.dataset.tab = ds.id;
    btn.textContent = ds.name;
    btn.addEventListener('click', function() { activateTab(ds.id); });
    tabsContainer.appendChild(btn);

    // Tab content
    var content = document.createElement('div');
    content.className = 'tab-content' + (first ? ' active' : '');
    content.id = 'tab-' + ds.id;

    if (!ds.sample_file || ds.rows.length === 0) {
      // Coming soon
      content.innerHTML = `
        <div class="placeholder-msg">
          <p>Sample data for ${ds.name} coming soon.</p>
          <a href="index.html#contact" class="btn-primary">Request full sample</a>
        </div>
      `;
    } else {
      // Build table
      var thead = ds.columns.map(function(col) {
        return '<th>' + col + '</th>';
      }).join('');

      var tbody = ds.rows.map(function(row) {
        var cells = row.map(function(cell, i) {
          // First column is always image
          if (i === 0) {
            return '<td><img src="' + cell + '" alt="" loading="lazy"></td>';
          }
          // Last column highlight if it looks like a price (sold price)
          if (i === row.length - 1 && ds.columns[i] && ds.columns[i].toLowerCase().includes('sold')) {
            return '<td class="sold">' + cell + '</td>';
          }
          return '<td>' + cell + '</td>';
        }).join('');
        return '<tr>' + cells + '</tr>';
      }).join('');

      content.innerHTML = `
        <div class="table-wrap">
          <table>
            <thead><tr>${thead}</tr></thead>
            <tbody>${tbody}</tbody>
          </table>
        </div>
        <p class="table-note">Showing ${ds.rows.length} of ${ds.record_count} records. <a href="index.html#contact">Contact us</a> for a full sample file.</p>
      `;
    }

    tablesContainer.appendChild(content);
    first = false;
  });
}

// ── Contact dropdown ──
function buildContactDropdown(datasets) {
  var select = document.getElementById('dataset-select');
  if (!select) return;

  datasets.forEach(function(ds) {
    var opt = document.createElement('option');
    opt.value = ds.name;
    opt.textContent = ds.name;
    select.appendChild(opt);
  });
  // Add "All datasets" and "Custom requirement"
  ['All datasets', 'Custom requirement'].forEach(function(label) {
    var opt = document.createElement('option');
    opt.value = label;
    opt.textContent = label;
    select.appendChild(opt);
  });
}

// ── Tab switcher ──
function activateTab(tabId) {
  document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });

  var btn = document.querySelector('.tab[data-tab="' + tabId + '"]');
  var content = document.getElementById('tab-' + tabId);
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');
}