/**
 * Verification Results Component
 * 
 * Displays the results of SEO fix verifications in the client dashboard,
 * showing metrics, comparisons, and success indicators.
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '../../ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '../../ui/accordion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Zap,
  LineChart,
  Images,
  List 
} from 'lucide-react';
import { Button } from '../../ui/button';
import { useSiteData } from '../../../hooks/useSiteData';
import { formatDate } from '../../../utils/dateFormatter';

const VerificationResults = ({ siteId }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { getSiteVerificationResults } = useSiteData();

  useEffect(() => {
    const fetchVerificationResults = async () => {
      try {
        setLoading(true);
        const data = await getSiteVerificationResults(siteId);
        setResults(data);
        setError(null);
      } catch (err) {
        setError('Failed to load verification results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationResults();
  }, [siteId, getSiteVerificationResults]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-gray-500">Loading verification results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.fixes.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <List size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">No verification results</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              No fixes have been verified yet. Once fixes are implemented, verification results will appear here.
            </p>
            <Button className="mt-4" variant="outline">Run Verification</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Verification Results</CardTitle>
              <CardDescription>
                Last verified: {formatDate(results.timestamp)}
              </CardDescription>
            </div>
            <Badge className={results.success ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
              {results.success ? (
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} />
                  All Fixes Verified
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle size={16} />
                  Some Fixes Need Attention
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Fixes</div>
              <div className="text-2xl font-semibold">{results.summary.total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Successful</div>
              <div className="text-2xl font-semibold text-green-700">{results.summary.successful}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Failed</div>
              <div className="text-2xl font-semibold text-red-700">{results.summary.failed}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Average Improvement</div>
              <div className="text-2xl font-semibold text-blue-700">{results.summary.averageImprovement}</div>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between mb-1 text-sm">
              <div>Success Rate</div>
              <div>{results.summary.successRate}</div>
            </div>
            <Progress 
              value={parseFloat(results.summary.successRate)} 
              className={`h-2 ${parseFloat(results.summary.successRate) >= 90 ? 'bg-green-100' : 'bg-amber-100'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="visual">Visual Comparison</TabsTrigger>
              <TabsTrigger value="tests">Regression Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Fixes by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={transformFixesByType(results.fixes)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successful" fill="#10b981" name="Successful" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Fix Details</h3>
                <Accordion type="single" collapsible className="w-full">
                  {results.fixes.map((fix, index) => (
                    <AccordionItem key={index} value={`fix-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          {fix.success ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <XCircle size={18} className="text-red-500" />
                          )}
                          <span className="capitalize">{fix.type} Fix</span>
                          {fix.improvementPercentage > 0 && (
                            <Badge variant="outline" className="ml-2 bg-blue-50">
                              {fix.improvementPercentage.toFixed(1)}% Improvement
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-6 border-l-2 border-gray-100 ml-2 mt-2">
                          <div className="text-sm text-gray-500 mb-2">
                            Verification strategies applied:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                            {fix.strategies?.map((strategy, i) => (
                              <div 
                                key={i} 
                                className={`p-2 rounded flex items-center gap-2 text-sm ${
                                  strategy.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {strategy.success ? (
                                  <CheckCircle size={16} />
                                ) : (
                                  <XCircle size={16} />
                                )}
                                {formatStrategyName(strategy.name)}
                              </div>
                            ))}
                          </div>
                          {fix.details && (
                            <div className="text-sm">
                              <p className="font-medium mb-1">Details:</p>
                              <p className="text-gray-600">{fix.details}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance Metrics</h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={20} className="text-blue-600" />
                    <span className="font-medium">Overall Performance Improvement</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {results.summary.averageImprovement}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Performance Metrics by Fix</h4>
                  {results.fixes.filter(fix => fix.improvementPercentage > 0).length === 0 ? (
                    <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">
                      No performance metrics available
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fix Type</TableHead>
                          <TableHead>Before</TableHead>
                          <TableHead>After</TableHead>
                          <TableHead>Improvement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.fixes.filter(fix => fix.improvementPercentage > 0).map((fix, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium capitalize">{fix.type}</TableCell>
                            <TableCell>{fix.before || 'N/A'}</TableCell>
                            <TableCell>{fix.after || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className={fix.improvementPercentage > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {fix.improvementPercentage > 0 ? '+' : ''}{fix.improvementPercentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                
                {/* We'd include more detailed performance charts here in a real implementation */}
              </div>
            </TabsContent>
            
            <TabsContent value="visual">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Visual Comparisons</h3>
                
                {!results.visualComparisons || results.visualComparisons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <Images size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No visual comparisons</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">
                      No visual comparison data is available for these fixes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.visualComparisons.map((comparison, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">
                              {comparison.url.replace(/^https?:\/\//, '').split('/')[0]}
                            </CardTitle>
                            <Badge className={comparison.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {comparison.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          <CardDescription>
                            {comparison.device}, Difference: {comparison.differencePercentage.toFixed(1)}%
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="p-2">
                              <div className="text-xs text-gray-500 mb-1">Before</div>
                              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                                {/* In a real implementation, we'd display the actual screenshots */}
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  Before Image
                                </div>
                              </div>
                            </div>
                            <div className="p-2">
                              <div className="text-xs text-gray-500 mb-1">After</div>
                              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  After Image
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tests">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Regression Tests</h3>
                
                {!results.tests || results.tests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <LineChart size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No regression tests</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">
                      No regression test data is available for these fixes.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.tests.map((test, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div>
                              {test.name}
                              {test.critical && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Critical
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{test.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {test.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.duration}ms</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="p-0 h-auto">
                              <ChevronDown size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions for data transformation
function transformFixesByType(fixes) {
  const groupedByType = {};
  
  fixes.forEach(fix => {
    if (!groupedByType[fix.type]) {
      groupedByType[fix.type] = { name: fix.type, successful: 0, failed: 0 };
    }
    
    if (fix.success) {
      groupedByType[fix.type].successful++;
    } else {
      groupedByType[fix.type].failed++;
    }
  });
  
  return Object.values(groupedByType);
}

function formatStrategyName(strategy) {
  switch (strategy) {
    case 'beforeAfter':
      return 'Before/After Comparison';
    case 'performance':
      return 'Performance Impact';
    case 'regression':
      return 'Regression Testing';
    case 'visual':
      return 'Visual Comparison';
    default:
      return strategy;
  }
}

export default VerificationResults;
