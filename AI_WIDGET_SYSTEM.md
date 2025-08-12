# AI Widget System - Type to Create

## Overview

The PREP Construction Management System now includes an AI-powered widget generator that allows users to create custom widgets using natural language descriptions. This system provides two paths for widget creation:

1. **Standard Builder** - Traditional step-by-step configuration
2. **Type to Create** - AI-powered natural language widget generator

## Features

### Default Widgets
On first load, the dashboard is pre-populated with useful default widgets:

- **Total Projects** (md) - Overview of all projects
- **Active Projects** (md) - Currently active project list
- **Active Project KPIs** (lg) - On-time, completion, and risk metrics
- **Budget vs Spend** (xl) - Financial tracking trend
- **ITT Deadlines** (md) - Pending tender responses
- **Supplier Performance Rankings** (lg) - Top performing suppliers

### Type to Create AI Generator

#### How to Use
1. Click the "Create Widget" button in the header
2. Choose "Type to Create" from the modal
3. Describe your widget in natural language
4. See a live preview of your widget
5. Refine if needed, then insert to dashboard

#### Example Prompts
- "Show ITT deadlines due next 14 days by region as a bar chart"
- "Top 5 suppliers by on-time % in UK last quarter"
- "Budget vs spend for active projects, monthly line chart, xl"
- "Count of defects by type this month, table, md"
- "KPI: on-time completion % for healthcare projects, sm"
- "Compare UK vs USA project performance as pie chart"
- "Supplier performance rankings by category, lg"
- "Monthly budget variance trend, line chart"

#### Supported Data Sources
- **Projects** - Project data and metrics
- **ITTs** - Tender and procurement data
- **Suppliers** - Supplier performance data
- **Costs** - Budget and financial data
- **Issues** - Problem and defect tracking
- **Regional** - Geographic performance metrics

#### Supported Visualizations
- **KPI** - Single metric display
- **Bar Chart** - Categorical comparisons
- **Line Chart** - Trends over time
- **Pie Chart** - Proportional breakdown
- **Table** - Detailed data list
- **Progress** - Goal tracking
- **Card** - Rich content cards

#### Widget Sizes
- **Small (sm)** - Compact KPI or mini chart
- **Medium (md)** - Standard widget with 2-3 metrics
- **Large (lg)** - Rich chart with legend
- **Extra Large (xl)** - Full chart with annotations

## Technical Implementation

### Architecture
- **Widget Parser** (`lib/widgetParser.ts`) - Converts natural language to widget definitions
- **Mock Data Generator** (`lib/mockDataGenerator.ts`) - Creates realistic preview data
- **Widget Preview** (`components/widgets/WidgetPreview.tsx`) - Renders live previews
- **Type to Create Modal** (`components/modals/TypeToCreateWidgetModal.tsx`) - Main interface
- **Widget Chooser** (`components/modals/WidgetChooserModal.tsx`) - Path selection

### Key Components

#### Widget Definition Interface
```typescript
interface WidgetDefinition {
  name: string
  source: DataSource
  filters: Filter[]
  groupBy?: string[]
  metrics: Metric[]
  viz: VisualizationType
  size: WidgetSizeAI
  options?: {
    decimals?: number
    abbreviate?: boolean
    legend?: boolean
    axisLabels?: boolean
    limit?: number
    orderBy?: { field: string; direction: 'asc' | 'desc' }
  }
  dateScope?: DateScope
  dateRange?: {
    start: string
    end: string
  }
}
```

#### Natural Language Parsing
The system uses keyword-based parsing to understand user intent:

- **Source Detection** - Identifies data source from keywords
- **Time Window Extraction** - Parses date ranges and time filters
- **Dimension Grouping** - Detects grouping by region, category, etc.
- **Metric Extraction** - Identifies count, sum, average, etc.
- **Visualization Selection** - Chooses appropriate chart type
- **Size Determination** - Selects optimal widget size

#### Smart Defaults
- If no visualization specified, defaults to bar chart for grouped data
- If no size specified, chooses based on visualization type
- If no metrics specified, defaults to count
- If no grouping specified, suggests based on context

### Integration with Dashboard
- AI widgets are stored in the same Zustand store as standard widgets
- They participate in the drag-and-drop reordering system
- They can be resized, enabled/disabled, and deleted
- They persist to localStorage with the rest of the dashboard

## Future Enhancements

### Planned Features
1. **LLM Integration** - Replace keyword parsing with actual LLM calls
2. **Real Data Sources** - Connect to actual Firebase/API data
3. **Advanced Filtering** - More sophisticated filter combinations
4. **Widget Templates** - Save and reuse widget configurations
5. **Collaborative Widgets** - Share widgets between team members

### API Integration Points
The system is designed to easily swap mock data for real API calls:

```typescript
// Current mock data generation
const mockData = generateMockData(definition)

// Future real data integration
const realData = await fetchWidgetData(definition)
```

## Usage Examples

### Simple KPI Widget
**Input:** "Show total active projects"
**Result:** KPI widget displaying count of active projects

### Complex Chart Widget
**Input:** "Budget vs spend trend for UK projects, monthly line chart, xl"
**Result:** Large line chart showing monthly budget vs spend for UK projects

### Filtered Table Widget
**Input:** "Top 10 suppliers by score, table format"
**Result:** Table widget showing top 10 suppliers ranked by performance score

## Best Practices

### Writing Effective Prompts
1. **Be Specific** - Include data source, filters, and visualization
2. **Use Keywords** - Use terms like "bar chart", "line chart", "KPI"
3. **Specify Size** - Add "sm", "md", "lg", or "xl" for size control
4. **Include Time Ranges** - Use "this month", "last quarter", "next 14 days"
5. **Mention Filters** - Specify regions, categories, or status filters

### Widget Optimization
- Use small widgets for single metrics
- Use large widgets for complex charts
- Group related data for better insights
- Consider time-based trends for financial data
- Use appropriate visualizations for data types

## Troubleshooting

### Common Issues
1. **Parser Not Understanding** - Try using more specific keywords
2. **Wrong Visualization** - Explicitly mention chart type
3. **Incorrect Size** - Specify size explicitly (sm/md/lg/xl)
4. **Missing Data** - Ensure data source is available

### Validation Errors
The system validates widget definitions and shows errors for:
- Missing required fields
- Invalid field names
- Incompatible combinations
- Unsupported data sources

## Development Notes

### Adding New Data Sources
1. Add source to `DataSource` type
2. Update `SOURCE_KEYWORDS` mapping
3. Add fields to `SOURCE_FIELDS`
4. Create mock data generator function
5. Update preview component

### Adding New Visualizations
1. Add to `VisualizationType` type
2. Update `VIZ_KEYWORDS` mapping
3. Add preview component
4. Update size recommendations

### Testing the Parser
Use the test examples in the modal or try variations like:
- "Show projects by status"
- "ITT deadlines this week"
- "Supplier performance by region"
- "Budget variance trend" 