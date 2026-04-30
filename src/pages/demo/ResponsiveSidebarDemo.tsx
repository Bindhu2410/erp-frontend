import React from "react";

const ResponsiveSidebarDemo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Responsive Sidebar Demo
        </h1>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">
                📱 Mobile First
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Full-screen overlay on mobile</li>
                <li>• Touch-friendly targets (44px minimum)</li>
                <li>• Swipe-to-close gesture support</li>
                <li>• Auto-close after navigation</li>
                <li>• Prevents body scroll when open</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">💻 Desktop</h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Collapsible to icon-only mode</li>
                <li>• Hover tooltips when collapsed</li>
                <li>• Smooth width transitions</li>
                <li>• Persistent state preferences</li>
                <li>• Keyboard navigation support</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3">📱 Tablet</h3>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• Optimized width (224px)</li>
                <li>• Balanced icon and text sizing</li>
                <li>• Touch and mouse support</li>
                <li>• Auto-responsive behavior</li>
                <li>• Portrait/landscape adaptation</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Responsive Breakpoints
          </h2>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-red-100 text-red-800 px-3 py-2 rounded-md font-semibold mb-2">
                  Mobile
                </div>
                <div className="text-sm text-gray-600">
                  &lt; 768px
                  <br />
                  Overlay mode
                  <br />
                  Auto-close behavior
                </div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md font-semibold mb-2">
                  Tablet
                </div>
                <div className="text-sm text-gray-600">
                  768px - 1024px
                  <br />
                  56px collapsed / 224px expanded
                  <br />
                  Side-by-side layout
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-md font-semibold mb-2">
                  Desktop
                </div>
                <div className="text-sm text-gray-600">
                  &gt; 1024px
                  <br />
                  80px collapsed / 256px expanded
                  <br />
                  Hover tooltips when collapsed
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Accessibility Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">
                Keyboard Navigation
              </h4>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Tab navigation through menu items</li>
                <li>• Enter/Space to activate menu items</li>
                <li>• Arrow keys for submenu navigation</li>
                <li>• Escape to close on mobile</li>
              </ul>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <h4 className="font-semibold text-teal-900 mb-2">
                Screen Reader Support
              </h4>
              <ul className="text-sm text-teal-800 space-y-1">
                <li>• Proper ARIA labels and roles</li>
                <li>• Semantic HTML structure</li>
                <li>• Focus management</li>
                <li>• State announcements</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How to Test
          </h2>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-6">
            <h4 className="font-semibold text-amber-900 mb-3">
              Testing Instructions:
            </h4>
            <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
              <li>Open browser developer tools (F12)</li>
              <li>Toggle device toolbar for mobile simulation</li>
              <li>Test different screen sizes: iPhone, iPad, Desktop</li>
              <li>Try clicking the hamburger menu on different devices</li>
              <li>Test navigation and auto-close behavior</li>
              <li>Verify touch targets are appropriately sized</li>
            </ol>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">
              Current Screen Info:
            </h4>
            <div className="text-sm text-blue-800">
              <p>
                Screen Width: <span id="screen-width">Loading...</span>px
              </p>
              <p>
                Device Type: <span id="device-type">Loading...</span>
              </p>
              <p>
                Sidebar State: <span id="sidebar-state">Loading...</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveSidebarDemo;
