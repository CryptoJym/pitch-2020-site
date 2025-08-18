// Deep Dive Detail Enhancements
(function() {
  'use strict';

  // Add expandable details to each slide
  const enhanceDeepDiveSlides = () => {
    // Slide 1: What We Learned - Add expandable insights
    const slide1 = document.querySelector('[data-slide="1"] .slide-content');
    if (slide1) {
      const insightCards = slide1.querySelectorAll('.insight-card');
      insightCards.forEach((card, index) => {
        const title = card.querySelector('h3');
        if (title) {
          // Add expand icon
          const expandIcon = document.createElement('span');
          expandIcon.innerHTML = '⊕';
          expandIcon.style.cssText = 'float: right; cursor: pointer; transition: transform 0.3s ease;';
          title.appendChild(expandIcon);
          
          // Add detailed content
          const details = document.createElement('div');
          details.className = 'insight-details';
          details.style.cssText = 'max-height: 0; overflow: hidden; transition: max-height 0.3s ease; margin-top: 1rem;';
          
          // Add specific details based on card
          const detailsContent = getSlide1Details(index);
          details.innerHTML = detailsContent;
          card.appendChild(details);
          
          // Toggle functionality
          title.style.cursor = 'pointer';
          title.addEventListener('click', () => {
            const isExpanded = details.style.maxHeight && details.style.maxHeight !== '0px';
            details.style.maxHeight = isExpanded ? '0' : '500px';
            expandIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(45deg)';
          });
        }
      });
    }

    // Slide 3: Phased Rollout - Add hover details
    const phaseRows = document.querySelectorAll('.phase-table tbody tr');
    phaseRows.forEach((row, index) => {
      const detailTooltip = document.createElement('div');
      detailTooltip.className = 'phase-detail-tooltip';
      detailTooltip.innerHTML = getPhaseDetails(index + 1);
      detailTooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid var(--accent);
        border-radius: 0.5rem;
        padding: 1rem;
        max-width: 300px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        z-index: 1000;
      `;
      document.body.appendChild(detailTooltip);
      
      row.addEventListener('mouseenter', (e) => {
        const rect = row.getBoundingClientRect();
        detailTooltip.style.left = rect.right + 10 + 'px';
        detailTooltip.style.top = rect.top + 'px';
        detailTooltip.style.opacity = '1';
      });
      
      row.addEventListener('mouseleave', () => {
        detailTooltip.style.opacity = '0';
      });
    });

    // Slide 4: Replace/Augment/No-Go - Add impact metrics
    const decisionColumns = document.querySelectorAll('.decision-column');
    decisionColumns.forEach((column) => {
      const impactBadge = document.createElement('div');
      impactBadge.className = 'impact-badge';
      impactBadge.style.cssText = `
        position: absolute;
        top: -10px;
        right: -10px;
        background: var(--accent);
        color: #000;
        padding: 0.5rem 1rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(79, 172, 254, 0.5);
      `;
      
      if (column.classList.contains('replace')) {
        impactBadge.textContent = '60% Cost Reduction';
      } else if (column.classList.contains('augment')) {
        impactBadge.textContent = '3x Productivity';
      } else if (column.classList.contains('nogo')) {
        impactBadge.textContent = 'Human Touch';
      }
      
      column.style.position = 'relative';
      column.appendChild(impactBadge);
    });
  };

  // Detail content for Slide 1
  function getSlide1Details(index) {
    const details = [
      // Identity & Workforce
      `<div class="detail-content">
        <h4>Deep Dive: Organizational Structure</h4>
        <ul>
          <li><strong>Field Force Breakdown:</strong>
            <ul>
              <li>2,800 W-2 field reps (Samsung, Meta programs)</li>
              <li>700 W-2 brand ambassadors (events/activations)</li>
              <li>10,000+ 1099 network for surge coverage</li>
            </ul>
          </li>
          <li><strong>Management Hierarchy:</strong>
            <ul>
              <li>15 Regional Directors</li>
              <li>45 Market Managers</li>
              <li>60 Field Managers</li>
            </ul>
          </li>
          <li><strong>Key Clients:</strong> Samsung (40%), Meta (25%), Chromebook (15%), Others (20%)</li>
        </ul>
      </div>`,
      
      // Operational Rail
      `<div class="detail-content">
        <h4>Process Deep Dive</h4>
        <ul>
          <li><strong>Assignment (Day -1):</strong> Route optimization, skill matching, availability check</li>
          <li><strong>Evidence (Day 0):</strong> Photo capture, form completion, time tracking</li>
          <li><strong>Exception (Real-time):</strong> OOS alerts, compliance flags, no-shows</li>
          <li><strong>Approval (Day 0-1):</strong> Manager review, client escalation, resolution</li>
          <li><strong>Report (Day 1-7):</strong> Daily briefs, weekly rollups, monthly QBRs</li>
        </ul>
        <p><em>Current manual processing time: 4-6 hours per manager per day</em></p>
      </div>`,
      
      // Key Tech Stack
      `<div class="detail-content">
        <h4>Technology Integration Points</h4>
        <ul>
          <li><strong>Workday:</strong> 
            <ul>
              <li>Employee records, time & attendance</li>
              <li>Payroll processing, benefits admin</li>
              <li>API access confirmed ✓</li>
            </ul>
          </li>
          <li><strong>ThirdChannel:</strong>
            <ul>
              <li>Field app for photo/data capture</li>
              <li>Basic routing and scheduling</li>
              <li>Limited API, export capabilities</li>
            </ul>
          </li>
          <li><strong>PowerBI:</strong> Client reporting dashboards</li>
          <li><strong>SMS/Email:</strong> Twilio for comms (25k msgs/week)</li>
        </ul>
      </div>`,
      
      // Current Pain Points
      `<div class="detail-content">
        <h4>Quantified Pain Points</h4>
        <ul>
          <li><strong>Photo QA:</strong> 
            <ul>
              <li>3 mins/photo manual review</li>
              <li>5,000 photos/week</li>
              <li>250 hours/week manual effort</li>
            </ul>
          </li>
          <li><strong>Scheduling:</strong>
            <ul>
              <li>10% no-show rate</li>
              <li>3 hours/manager/week on coverage</li>
              <li>$1.1M annual lost productivity</li>
            </ul>
          </li>
          <li><strong>Reporting:</strong>
            <ul>
              <li>45 mins per daily brief</li>
              <li>4 hours per weekly rollup</li>
              <li>16 hours per QBR deck</li>
            </ul>
          </li>
        </ul>
      </div>`
    ];
    
    return details[index] || '';
  }

  // Phase details for tooltips
  function getPhaseDetails(phase) {
    const phaseDetails = {
      1: `<h4>MVP Details</h4>
          <p><strong>Computer Vision:</strong> TensorFlow model trained on 100k+ retail photos</p>
          <p><strong>Accuracy:</strong> 92%+ on planogram compliance</p>
          <p><strong>Processing:</strong> Real-time, 500ms per photo</p>
          <p><strong>Integration:</strong> Direct API to field app exports</p>`,
      
      2: `<h4>Atomic Rep Work</h4>
          <p><strong>Micro-training:</strong> 2-3 min contextual videos</p>
          <p><strong>Triggers:</strong> Based on exception patterns</p>
          <p><strong>Delivery:</strong> In-app push notifications</p>
          <p><strong>Tracking:</strong> Completion rates, performance delta</p>`,
      
      3: `<h4>Smart Routing</h4>
          <p><strong>Algorithm:</strong> Multi-constraint optimization</p>
          <p><strong>Factors:</strong> Skills, location, availability, history</p>
          <p><strong>No-show prediction:</strong> ML model 85% accuracy</p>
          <p><strong>Coverage improvement:</strong> From 90% to 97%</p>`,
      
      4: `<h4>Exception Management</h4>
          <p><strong>Auto-triage:</strong> Severity scoring algorithm</p>
          <p><strong>Smart routing:</strong> To appropriate manager level</p>
          <p><strong>SLA tracking:</strong> Real-time aging alerts</p>
          <p><strong>Resolution rate:</strong> Target <24 hours</p>`,
      
      5: `<h4>Recruiting Automation</h4>
          <p><strong>Candidate scoring:</strong> 15 factor model</p>
          <p><strong>Auto-scheduling:</strong> Calendar integration</p>
          <p><strong>Nudge campaigns:</strong> SMS/email sequences</p>
          <p><strong>Show rate improvement:</strong> From 60% to 80%</p>`
    };
    
    return phaseDetails[phase] || '<p>Details coming soon...</p>';
  }

  // Initialize after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceDeepDiveSlides);
  } else {
    enhanceDeepDiveSlides();
  }
})();