import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Badge,
  Progress,
  Separator
} from '../ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';
import { advancedGeeService } from '../services/advancedGeeService';
import { Brain, Droplets, Seedling, Map, Activity, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const AdvancedGeePanel = ({ selectedClient }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stress');
  const [data, setData] = useState({
    cropStress: null,
    irrigationPrediction: null,
    phenology: null,
    prescriptionMap: null,
    realTimeConditions: null
  });
  const [error, setError] = useState(null);

  // Colores para gráficos
  const stressColors = {
    'Saludable': '#22c55e',
    'Estrés Bajo': '#eab308',
    'Estrés Medio': '#f97316',
    'Estrés Alto': '#ef4444'
  };

  const phaseColors = {
    'Emergencia': '#10b981',
    'Vegetativo': '#22c55e',
    'Reproductivo': '#f59e0b',
    'Senescencia': '#ef4444'
  };

  useEffect(() => {
    if (selectedClient) {
      loadRealTimeConditions();
    }
  }, [selectedClient]);

  const loadRealTimeConditions = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      setError(null);
      
      const conditions = await advancedGeeService.getRealTimeConditions(selectedClient.name);
      setData(prev => ({ ...prev, realTimeConditions: conditions }));
    } catch (err) {
      setError(`Error cargando condiciones: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadStressAnalysis = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      setError(null);
      
      const stressData = await advancedGeeService.detectCropStress(selectedClient.name);
      const formattedData = advancedGeeService.formatStressData(stressData);
      
      setData(prev => ({ ...prev, cropStress: formattedData }));
    } catch (err) {
      setError(`Error en análisis de estrés: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadIrrigationPrediction = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      setError(null);
      
      const prediction = await advancedGeeService.predictIrrigationNeeds(selectedClient.name);
      setData(prev => ({ ...prev, irrigationPrediction: prediction }));
    } catch (err) {
      setError(`Error en predicción de riego: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPhenologyAnalysis = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      setError(null);
      
      const phenologyData = await advancedGeeService.analyzeCropPhenology(selectedClient.name);
      const formattedData = advancedGeeService.formatPhenologyData(phenologyData);
      
      setData(prev => ({ ...prev, phenology: formattedData }));
    } catch (err) {
      setError(`Error en análisis fenológico: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptionMap = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      setError(null);
      
      const prescriptionData = await advancedGeeService.generatePrescriptionMap(selectedClient.name);
      const formattedData = advancedGeeService.formatPrescriptionData(prescriptionData);
      
      setData(prev => ({ ...prev, prescriptionMap: formattedData }));
    } catch (err) {
      setError(`Error generando mapa de prescripción: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Cargar datos según la pestaña seleccionada
    switch (tab) {
      case 'stress':
        if (!data.cropStress) loadStressAnalysis();
        break;
      case 'irrigation':
        if (!data.irrigationPrediction) loadIrrigationPrediction();
        break;
      case 'phenology':
        if (!data.phenology) loadPhenologyAnalysis();
        break;
      case 'prescription':
        if (!data.prescriptionMap) loadPrescriptionMap();
        break;
    }
  };

  const renderStressAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Análisis de Estrés con IA
        </h3>
        <Button onClick={loadStressAnalysis} disabled={loading}>
          {loading ? 'Analizando...' : 'Actualizar'}
        </Button>
      </div>

      {data.cropStress && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Estrés</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.cropStress.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.cropStress.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={stressColors[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precisión del Modelo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Precisión ML:</span>
                    <Badge variant={data.cropStress.accuracy > 0.8 ? 'success' : 'warning'}>
                      {(data.cropStress.accuracy * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={data.cropStress.accuracy * 100} className="w-full" />
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recomendaciones:</h4>
                    <ul className="space-y-1">
                      {data.cropStress.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  const renderIrrigationPrediction = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Predicción de Riego
        </h3>
        <Button onClick={loadIrrigationPrediction} disabled={loading}>
          {loading ? 'Prediciendo...' : 'Actualizar'}
        </Button>
      </div>

      {data.irrigationPrediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Riego Necesario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {data.irrigationPrediction.irrigation_needed_mm} mm
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Próximos {data.irrigationPrediction.forecast_days || 7} días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ET Diaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.irrigationPrediction.daily_etc_mm} mm/día
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Evapotranspiración del cultivo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Coeficiente Kc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {data.irrigationPrediction.crop_coefficient}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Factor de cultivo actual
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Recomendación</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Droplets className="h-4 w-4" />
                <AlertDescription>
                  {data.irrigationPrediction.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderPhenologyAnalysis = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Seedling className="h-5 w-5" />
          Análisis Fenológico
        </h3>
        <Button onClick={loadPhenologyAnalysis} disabled={loading}>
          {loading ? 'Analizando...' : 'Actualizar'}
        </Button>
      </div>

      {data.phenology && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fase Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" style={{color: phaseColors[data.phenology.currentPhase] || '#6b7280'}}>
                    {data.phenology.currentPhase || 'Desconocido'}
                  </div>
                  <Badge variant="outline" className="mb-4">
                    Fase fenológica actual
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.phenology.transitions.slice(-3).map((transition, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(transition).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolución Temporal NDVI</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.phenology.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis domain={[0, 1]} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [value.toFixed(3), 'NDVI']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ndvi" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones por Fase</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.phenology.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderPrescriptionMap = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Map className="h-5 w-5" />
          Mapa de Prescripción Variable
        </h3>
        <Button onClick={loadPrescriptionMap} disabled={loading}>
          {loading ? 'Generando...' : 'Actualizar'}
        </Button>
      </div>

      {data.prescriptionMap && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Área Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.prescriptionMap.summary?.total_area_ha} ha
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Zonas de Manejo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.prescriptionMap.summary?.management_zones}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Intensidad Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.prescriptionMap.summary?.average_irrigation_intensity}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Intensidad de Riego por Zona</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.prescriptionMap.zones}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" tickFormatter={(id) => `Zona ${id + 1}`} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Intensidad']}
                    labelFormatter={(id) => `Zona ${id + 1}`}
                  />
                  <Bar dataKey="intensity" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de Aplicación</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.prescriptionMap.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderRealTimeConditions = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Condiciones en Tiempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.realTimeConditions ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">
                {data.realTimeConditions.vegetation_indices?.ndvi_mean?.toFixed(3) || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">NDVI Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {data.realTimeConditions.vegetation_indices?.ndwi_mean?.toFixed(3) || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">NDWI Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {data.realTimeConditions.crop_status || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Estado del Cultivo</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {data.realTimeConditions.cloud_cover_percent || 'N/A'}%
              </div>
              <div className="text-sm text-gray-500">Cobertura Nubosa</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            {loading ? 'Cargando condiciones...' : 'Seleccione un cliente para ver condiciones'}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!selectedClient) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Seleccione un Cliente
          </h3>
          <p className="text-gray-500">
            Seleccione un cliente para acceder a las funcionalidades avanzadas de Google Earth Engine
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {renderRealTimeConditions()}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stress">Estrés IA</TabsTrigger>
          <TabsTrigger value="irrigation">Predicción</TabsTrigger>
          <TabsTrigger value="phenology">Fenología</TabsTrigger>
          <TabsTrigger value="prescription">Prescripción</TabsTrigger>
        </TabsList>

        <TabsContent value="stress">
          {renderStressAnalysis()}
        </TabsContent>

        <TabsContent value="irrigation">
          {renderIrrigationPrediction()}
        </TabsContent>

        <TabsContent value="phenology">
          {renderPhenologyAnalysis()}
        </TabsContent>

        <TabsContent value="prescription">
          {renderPrescriptionMap()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedGeePanel;
