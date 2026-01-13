"use client";
import { useState, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ComposedChart, Line, ReferenceLine
} from 'recharts';
import { 
  Monitor, Users, HardDrive, AlertTriangle, CheckCircle, Search, FileUp, 
  Info, HelpCircle, X, FileSpreadsheet, PieChart as PieIcon, Activity, Percent, Gift
} from 'lucide-react';

// --- Default Sample Data ---
const defaultData = [
  { 
    department: "กลุ่มตรวจสอบภายใน (ตน.)", 
    officer: 1, govEmp: 1, permEmp: 0, totalPerson: 2, 
    pc63: 1, pc58: 1, pcTotalGreen: 2,
    nb63: 1, nb58: 0, nbTotalGreen: 1,
    newPc: 0, newNb: 0, newHighSpec: 0, totalNewAlloc: 0,
    pc57: 1, pc52: 0, nb57: 0, nb52: 1, 
    totalGreen: 3, totalOld: 2, totalComp: 5, 
    ratioGreen: 150, ratioTotal: 250 // New metrics
  },
  { 
    department: "กลุ่มพัฒนาระบบบริหาร (พร.)", 
    officer: 3, govEmp: 2, permEmp: 0, totalPerson: 5, 
    pc63: 0, pc58: 2, pcTotalGreen: 2,
    nb63: 3, nb58: 1, nbTotalGreen: 4,
    newPc: 0, newNb: 0, newHighSpec: 1, totalNewAlloc: 1,
    pc57: 0, pc52: 1, nb57: 0, nb52: 0,
    totalGreen: 7, totalOld: 1, totalComp: 8, 
    ratioGreen: 140, ratioTotal: 160
  },
  { 
    department: "สำนักงานเลขานุการกรม (สลก.)", 
    officer: 43, govEmp: 38, permEmp: 18, totalPerson: 99, 
    pc63: 30, pc58: 51, pcTotalGreen: 81,
    nb63: 8, nb58: 3, nbTotalGreen: 11,
    newPc: 20, newNb: 10, newHighSpec: 11, totalNewAlloc: 45,
    pc57: 15, pc52: 8, nb57: 0, nb52: 0,
    totalGreen: 141, totalOld: 23, totalComp: 164, 
    ratioGreen: 142.42, ratioTotal: 165.65
  },
  { 
    department: "สถาบันวิทยาศาสตร์เทคโนโลยีชุมชน (สทช.)", 
    officer: 35, govEmp: 35, permEmp: 3, totalPerson: 73, 
    pc63: 26, pc58: 26, pcTotalGreen: 52,
    nb63: 18, nb58: 0, nbTotalGreen: 18,
    newPc: 15, newNb: 13, newHighSpec: 7, totalNewAlloc: 35,
    pc57: 19, pc52: 14, nb57: 1, nb52: 1,
    totalGreen: 105, totalOld: 35, totalComp: 140, 
    ratioGreen: 143.83, ratioTotal: 191.78
  },
  { 
    department: "สำนักบริหารและรับรองห้องปฏิบัติการ (สบร.)", 
    officer: 22, govEmp: 11, permEmp: 0, totalPerson: 33, 
    pc63: 9, pc58: 13, pcTotalGreen: 22,
    nb63: 13, nb58: 1, nbTotalGreen: 14,
    newPc: 4, newNb: 4, newHighSpec: 2, totalNewAlloc: 11,
    pc57: 12, pc52: 9, nb57: 0, nb52: 1,
    totalGreen: 48, totalOld: 22, totalComp: 70, 
    ratioGreen: 145.45, ratioTotal: 212.12
  }
];

// Color Constants
const COLORS = { 
  green: '#10b981', old: '#f59e0b', blue: '#3b82f6', purple: '#8b5cf6', cyan: '#06b6d4', slate: '#64748b',
  newest: '#059669', // PC 63++
  midNew: '#34d399', // PC 62-58
  midOld: '#fbbf24', // PC 57-53
  veryOld: '#ef4444', // PC 52--
  allocPC: '#818cf8', allocNB: '#2dd4bf', allocHigh: '#c084fc',
  nbGreen: '#0ea5e9', nbOld: '#f97316',
  ratioTotal: '#94a3b8', // Slate 400
  ratioGreen: '#059669'  // Emerald 600
};

// Component: KPI Card
const KPICard = ({ title, value, subtext, icon: Icon, colorClass, definitions }: { title: string; value: string | number; subtext?: string; icon: React.ComponentType<{ className?: string }>; colorClass: string; definitions?: string }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow group relative">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
        {title}
        {definitions && <Info className="w-3 h-3 text-slate-300 cursor-help" />}
      </p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    {/* Tooltip on hover for definitions */}
    {definitions && (
      <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {definitions}
      </div>
    )}
  </div>
);

// Component: Help Modal
const HelpModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
        <X className="w-5 h-5" />
      </button>
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <FileSpreadsheet className="text-green-600" />
        คำแนะนำการนำเข้าไฟล์
      </h3>
      <div className="space-y-4 text-sm text-slate-600">
        <p>ระบบรองรับไฟล์ <strong>CSV UTF-8</strong> เพื่อการแสดงผลภาษาไทยที่ถูกต้อง</p>
        <div className="bg-blue-50 p-3 rounded border border-blue-100 text-blue-800">
            <strong>ความหมายของข้อมูล:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                <li><strong>รวมเขียว (Green):</strong> ผลรวมคอมพิวเตอร์สภาพดีทั้งหมด (รวมเครื่องใหม่ที่ได้รับจัดสรรแล้ว)</li>
                <li><strong>รวมเก่า (Old):</strong> ผลรวมคอมพิวเตอร์ที่เครื่องเก่า/รอจำหน่าย</li>
                <li><strong>ได้ใหม่:</strong> จำนวนเครื่องที่ได้รับการจัดสรรเพิ่มในปีงบประมาณปัจจุบัน</li>
            </ul>
        </div>
      </div>
      <button onClick={onClose} className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
        เข้าใจแล้ว
      </button>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(defaultData);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileName, setFileName] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'detailed'
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      alert("⚠️ ระบบนี้รองรับเฉพาะไฟล์ .csv ครับ\n\nกรุณากดปุ่ม 'วิธีเตรียมไฟล์' เพื่อดูขั้นตอนการบันทึก Excel เป็น CSV ง่ายๆ ครับ");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
      
      const parsedData = lines.slice(1).map((line, index) => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
        
        if (cols.length < 5) return null;

        const clean = (val: string) => {
            if (!val || val.trim() === '') return 0;
            return parseFloat(val.replace(/"/g, '').replace(/,/g, '')) || 0;
        };

        const departmentName = cols[0]?.trim().replace(/"/g, '');

        if (!departmentName || departmentName === '' || departmentName.includes('รวม') || departmentName.includes('Total')) {
            return null;
        }

        return {
          id: index,
          department: departmentName,
          officer: clean(cols[1]),     
          govEmp: clean(cols[2]),      
          permEmp: clean(cols[3]),     
          totalPerson: clean(cols[4]), 
          
          // PC Breakdown
          pc63: clean(cols[5]),
          pc58: clean(cols[6]),
          pcTotalGreen: clean(cols[7]),
          
          // Notebook Breakdown (Important)
          nb63: clean(cols[8]),
          nb58: clean(cols[9]),
          nbTotalGreen: clean(cols[10]),
          
          // New Allocations
          newPc: clean(cols[14]),       
          newNb: clean(cols[15]),       
          newHighSpec: clean(cols[16]), 
          totalNewAlloc: clean(cols[17]),
          
          // Old Breakdown
          pc57: clean(cols[20]),
          pc52: clean(cols[21]),
          nb57: clean(cols[22]),
          nb52: clean(cols[23]),
          
          // Summaries
          totalGreen: clean(cols[18]), 
          totalOld: clean(cols[24]),   
          totalComp: clean(cols[25]),  
          
          // Ratios
          ratioGreen: clean(cols[19]), 
          ratioTotal: clean(cols[26])  
        };
      })
      .filter((item): item is Exclude<typeof item, null> => item !== null && (item.totalPerson > 0 || item.totalComp > 0));

      if (parsedData.length > 0) {
        setData(parsedData);
      } else {
        alert("ไม่สามารถอ่านข้อมูลได้ หรือไฟล์ว่างเปล่า กรุณาตรวจสอบรูปแบบไฟล์ CSV");
      }
    };

    reader.readAsText(file);
  };

  // Stats Calculation
  const stats = useMemo(() => {
    return data.reduce((acc, curr) => ({
      totalPerson: acc.totalPerson + curr.totalPerson,
      totalComp: acc.totalComp + curr.totalComp,
      totalGreen: acc.totalGreen + curr.totalGreen,
      totalOld: acc.totalOld + curr.totalOld,
      newAlloc: acc.newAlloc + (curr.totalNewAlloc || 0),
      // Detailed Stats
      pcGreen: acc.pcGreen + curr.pcTotalGreen,
      nbGreen: acc.nbGreen + curr.nbTotalGreen,
      pcOld: acc.pcOld + (curr.pc57 + curr.pc52),
      nbOld: acc.nbOld + (curr.nb57 + curr.nb52)
    }), { totalPerson: 0, totalComp: 0, totalGreen: 0, totalOld: 0, newAlloc: 0, pcGreen: 0, nbGreen: 0, pcOld: 0, nbOld: 0 });
  }, [data]);

  const greenPercentage = stats.totalComp > 0 ? Math.round((stats.totalGreen / stats.totalComp) * 100) : 0;
  
  const chartData = data.filter(item => 
    item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allocPieData = data.reduce((acc, curr) => {
    acc[0].value += curr.newPc;
    acc[1].value += curr.newNb;
    acc[2].value += curr.newHighSpec;
    return acc;
  }, [
    { name: 'PC ทั่วไป', value: 0, color: COLORS.allocPC },
    { name: 'Notebook', value: 0, color: COLORS.allocNB },
    { name: 'PC สเปคสูง', value: 0, color: COLORS.allocHigh },
  ]).filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Monitor className="text-blue-600" /> 
            IT Inventory Dashboard
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
             {fileName ? (
               <span className="flex items-center gap-1 text-emerald-600 font-medium">
                 <CheckCircle className="w-4 h-4" /> แหล่งข้อมูล: {fileName} <span className="text-slate-400 mx-1">|</span> {data.length} หน่วยงาน
               </span>
             ) : (
               "โหมดตัวอย่าง (กรุณานำเข้าไฟล์จริง)"
             )}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
           {/* View Toggles */}
           <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode('overview')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'overview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <PieIcon className="w-4 h-4" /> ภาพรวม
             </button>
             <button 
               onClick={() => setViewMode('detailed')}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'detailed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Activity className="w-4 h-4" /> วิเคราะห์เชิงลึก
             </button>
           </div>

           <input type="file" accept=".csv, .xlsx" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
           
           <div className="flex gap-2">
              <button 
                onClick={() => setShowHelp(true)}
                className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                title="คำอธิบายข้อมูล"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
              >
                <FileUp className="w-4 h-4" />
                นำเข้า CSV
              </button>
           </div>

          <div className="relative grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="ค้นหาหน่วยงาน..." 
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="บุคลากรทั้งหมด" 
          value={stats.totalPerson.toLocaleString()} 
          subtext="คน" 
          icon={Users} 
          colorClass="bg-blue-500" 
        />
        <KPICard 
          title="คอมพิวเตอร์ทั้งหมด" 
          value={stats.totalComp.toLocaleString()} 
          subtext="เครื่อง (PC + Notebook)" 
          icon={HardDrive} 
          colorClass="bg-purple-500"
          definitions="นับรวมทั้งคอมพิวเตอร์ตั้งโต๊ะ (PC) และโน้ตบุ๊ก (Notebook)"
        />
        <KPICard 
          title="รวมเขียว (Green)" 
          value={stats.totalGreen.toLocaleString()} 
          subtext={`PC+NB สภาพดี (${greenPercentage}%)`} 
          icon={CheckCircle} 
          colorClass="bg-emerald-500"
          definitions="ค่า 'รวมเขียว' คือ ผลรวมของ PC และ Notebook ที่มีสภาพดี (อายุการใช้งานไม่เกินเกณฑ์)"
        />
        <KPICard 
          title="รวมเก่า (Old)" 
          value={stats.totalOld.toLocaleString()} 
          subtext="PC+NB สภาพเก่า" 
          icon={AlertTriangle} 
          colorClass="bg-amber-500"
          definitions="ค่า 'รวมเก่า' คือ ผลรวมของ PC และ Notebook ที่อายุการใช้งานเกินเกณฑ์หรือชำรุด"
        />
      </div>

      {viewMode === 'overview' ? (
        <>
            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">สถานะคอมพิวเตอร์รายหน่วยงาน</h3>
                <div className="flex gap-4 text-xs font-medium">
                   <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div> รวมเขียว (PC+NB)</div>
                   <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500"></div> รวมเก่า (PC+NB)</div>
                </div>
              </div>
              <div className="h-100">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="department" type="category" width={180} tick={{fontSize: 10}} interval={0} />
                    <RechartsTooltip 
                        cursor={{fill: '#f8fafc'}} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="totalGreen" name="รวมเขียว (PC+NB)" stackId="a" fill={COLORS.green} radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="totalOld" name="รวมเก่า (PC+NB)" stackId="a" fill={COLORS.old} radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col grow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">สัดส่วนการจัดสรรเครื่องใหม่</h3>
                    <p className="text-xs text-slate-500 mb-4">ประเภทเครื่องที่ได้รับจัดสรรในปีนี้</p>
                    <div className="grow relative min-h-50">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={allocPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            >
                            {allocPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-6 text-center pointer-events-none">
                        <span className="text-3xl font-bold text-slate-800 block">{stats.newAlloc}</span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">เครื่องใหม่</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-blue-600" />
                    การวิเคราะห์ความครอบคลุม (Coverage Analysis)
                  </h3>
                  <p className="text-sm text-slate-500">เปรียบเทียบร้อยละของคอมพิวเตอร์ต่อจำนวนบุคลากร (ค่า {'>'}100% แสดงว่ามีเครื่องมากกว่าคน)</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                   <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-400"></div> คอมพ์ทั้งหมดต่อคน (%)</div>
                   <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-600"></div> คอมพ์สภาพดีต่อคน (%)</div>
                </div>
            </div>
            <div className="h-87.5">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="department" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={80}/>
                  <YAxis unit="%" />
                  <RechartsTooltip />
                  <ReferenceLine y={100} stroke="red" strokeDasharray="3 3" label={{ value: '100% (1 คน 1 เครื่อง)', position: 'insideTopLeft', fill: 'red', fontSize: 10 }} />
                  <Bar dataKey="ratioTotal" name="คอมพ์ทั้งหมดต่อคน (%)" barSize={30} fill={COLORS.ratioTotal} radius={[4, 4, 0, 0]} opacity={0.6} />
                  <Line type="monotone" dataKey="ratioGreen" name="คอมพ์สภาพดีต่อคน (%)" stroke={COLORS.ratioGreen} strokeWidth={3} dot={{r: 4, fill: COLORS.ratioGreen}} activeDot={{r: 6}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <>
           {/* Detailed Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="text-lg font-semibold text-slate-800 mb-2">แยกประเภทเครื่องสภาพดี (เขียว)</h3>
               <p className="text-xs text-slate-500 mb-6">เปรียบเทียบจำนวน PC และ Notebook ที่ยังใช้งานได้ดี</p>
               <div className="h-125">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                     <XAxis type="number" />
                     <YAxis dataKey="department" type="category" width={150} tick={{fontSize: 10}} />
                     <RechartsTooltip />
                     <Legend />
                     <Bar dataKey="pcTotalGreen" name="PC เขียว" stackId="a" fill={COLORS.green} barSize={20} />
                     <Bar dataKey="nbTotalGreen" name="Notebook เขียว" stackId="a" fill={COLORS.nbGreen} barSize={20} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="text-lg font-semibold text-slate-800 mb-2">แยกประเภทเครื่องเก่า (ต้องปลด)</h3>
               <p className="text-xs text-slate-500 mb-6">เครื่อง PC และ Notebook ที่อายุการใช้งานเกินเกณฑ์</p>
               <div className="h-125">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                     <XAxis type="number" />
                     <YAxis dataKey="department" type="category" width={150} tick={{fontSize: 10}} />
                     <RechartsTooltip />
                     <Legend />
                     <Bar dataKey="pc57" name="PC เก่า (57-53)" stackId="a" fill={COLORS.midOld} barSize={20} />
                     <Bar dataKey="pc52" name="PC เก่ามาก (52--)" stackId="a" fill={COLORS.veryOld} barSize={20} />
                     <Bar dataKey="nb57" name="NB เก่า (57-53)" stackId="a" fill={COLORS.nbOld} barSize={20} />
                     <Bar dataKey="nb52" name="NB เก่ามาก (52--)" stackId="a" fill="#7c2d12" barSize={20} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
        </>
      )}

      {/* Detailed Data Table (Enhanced with Legend) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h3 className="text-lg font-semibold text-slate-800">ตารางข้อมูลแบบละเอียด</h3>
                <p className="text-xs text-slate-500">เลื่อนแนวนอนเพื่อดูข้อมูลคอลัมน์เพิ่มเติม</p>
             </div>
             <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                แสดง {chartData.length} รายการ
             </span>
          </div>

          {/* New Table Legend / Explanation Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
             <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <div>
                    <span className="font-bold text-slate-700">รวมเขียว:</span> <br/>
                    <span className="text-slate-500">PC + Notebook สภาพดีทั้งหมด (รวมเครื่องใหม่แล้ว)</span>
                </div>
             </div>
             <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                <div>
                    <span className="font-bold text-slate-700">รวมเก่า:</span> <br/>
                    <span className="text-slate-500">PC + Notebook เครื่องเก่า/รอจำหน่าย</span>
                </div>
             </div>
             <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
                <div>
                    <span className="font-bold text-slate-700">ได้ใหม่ (Allocations):</span> <br/>
                    <span className="text-slate-500">เครื่องที่ได้รับจัดสรรเพิ่มในปีงบประมาณนี้</span>
                </div>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-125">
          <table className="w-full text-sm text-left relative whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-medium bg-slate-50 sticky left-0 z-20 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)] min-w-50">หน่วยงาน</th>
                <th className="px-4 py-4 font-medium text-center bg-blue-50/50">บุคลากร</th>
                
                {/* Main Summaries with Tooltips */}
                <th className="px-4 py-4 font-medium text-center text-emerald-700 bg-emerald-50/50 border-l border-emerald-100 cursor-help" title="ผลรวมของ PC และ Notebook สภาพดีทั้งหมด">รวมเขียว</th>
                <th className="px-4 py-4 font-medium text-center text-amber-700 bg-amber-50/50 border-l border-amber-100 cursor-help" title="ผลรวมของ PC และ Notebook ที่เก่า/ชำรุด">รวมเก่า</th>
                
                {/* Ratios */}
                 <th className="px-4 py-4 font-medium text-center bg-slate-100 border-l border-slate-200">ทั้งหมดต่อคน (%)</th>
                 <th className="px-4 py-4 font-medium text-center bg-emerald-100 text-emerald-800 border-l border-emerald-200">ดีต่อคน (%)</th>

                {/* Age Detail Headers */}
                <th className="px-4 py-4 font-medium text-center bg-slate-50 border-l border-slate-200">PC 63++</th>
                <th className="px-4 py-4 font-medium text-center bg-slate-50">PC 62-58</th>
                <th className="px-4 py-4 font-medium text-center bg-slate-50 text-red-500">PC 57-53</th>
                <th className="px-4 py-4 font-medium text-center bg-slate-50 text-red-600">PC 52--</th>
                <th className="px-4 py-4 font-medium text-center bg-sky-50 border-l border-sky-100 text-sky-700">NB 63++</th>
                <th className="px-4 py-4 font-medium text-center bg-sky-50 text-sky-700">NB 62-58</th>
                <th className="px-4 py-4 font-medium text-center bg-orange-50 text-orange-600 border-l border-orange-100">NB 57-53</th>
                <th className="px-4 py-4 font-medium text-center bg-orange-50 text-orange-700">NB 52--</th>

                {/* Allocation Headers with Grouping */}
                <th className="px-4 py-4 font-medium text-center bg-indigo-50/50 border-l border-indigo-100 text-indigo-700 cursor-help" title="เครื่อง PC ทั่วไปที่ได้รับในปีนี้">
                    <span className="flex items-center justify-center gap-1">ได้ใหม่ (PC) <Gift className="w-3 h-3"/></span>
                </th>
                <th className="px-4 py-4 font-medium text-center bg-indigo-50/50 text-purple-700 cursor-help" title="เครื่อง PC สเปคสูงที่ได้รับในปีนี้">
                    <span className="flex items-center justify-center gap-1">ได้ใหม่ (High) <Gift className="w-3 h-3"/></span>
                </th>
                <th className="px-4 py-4 font-medium text-center bg-indigo-50/50 text-teal-700 cursor-help" title="เครื่อง Notebook ที่ได้รับในปีนี้">
                    <span className="flex items-center justify-center gap-1">ได้ใหม่ (NB) <Gift className="w-3 h-3"/></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 sticky left-0 bg-white z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)] border-r border-slate-100">
                    <div className="truncate max-w-62.5" title={item.department}>{item.department}</div>
                  </td>
                  <td className="px-4 py-4 text-center font-medium bg-blue-50/10">{item.totalPerson}</td>
                  
                  {/* Summaries */}
                  <td className="px-4 py-4 text-center font-bold text-emerald-600 bg-emerald-50/10 border-l border-emerald-50">{item.totalGreen}</td>
                  <td className="px-4 py-4 text-center font-bold text-amber-600 bg-amber-50/10 border-l border-amber-50">{item.totalOld}</td>

                  {/* Ratios */}
                  <td className="px-4 py-4 text-center bg-slate-50/50 border-l border-slate-100">{item.ratioTotal ? item.ratioTotal.toFixed(0) : 0}%</td>
                  <td className="px-4 py-4 text-center bg-emerald-50/30 text-emerald-700 font-semibold border-l border-emerald-100">{item.ratioGreen ? item.ratioGreen.toFixed(0) : 0}%</td>
                  
                  {/* Age Details */}
                  <td className="px-4 py-4 text-center border-l border-slate-100 text-slate-400">{item.pc63 > 0 ? item.pc63 : '-'}</td>
                  <td className="px-4 py-4 text-center text-slate-400">{item.pc58 > 0 ? item.pc58 : '-'}</td>
                  <td className="px-4 py-4 text-center text-amber-500">{item.pc57 > 0 ? item.pc57 : '-'}</td>
                  <td className="px-4 py-4 text-center text-red-600 font-bold bg-red-50/30">{item.pc52 > 0 ? item.pc52 : '-'}</td>
                  <td className="px-4 py-4 text-center border-l border-sky-100 bg-sky-50/30 text-sky-600">{item.nb63 > 0 ? item.nb63 : '-'}</td>
                  <td className="px-4 py-4 text-center bg-sky-50/30 text-sky-600">{item.nb58 > 0 ? item.nb58 : '-'}</td>
                  <td className="px-4 py-4 text-center border-l border-orange-100 bg-orange-50/30 text-orange-500">{item.nb57 > 0 ? item.nb57 : '-'}</td>
                  <td className="px-4 py-4 text-center bg-orange-50/30 text-orange-700 font-bold">{item.nb52 > 0 ? item.nb52 : '-'}</td>

                  {/* Allocation Details */}
                  <td className="px-4 py-4 text-center border-l border-indigo-50 bg-indigo-50/10 text-indigo-600 font-medium">{item.newPc > 0 ? `+${item.newPc}` : '-'}</td>
                  <td className="px-4 py-4 text-center bg-indigo-50/10 text-purple-600 font-medium">{item.newHighSpec > 0 ? `+${item.newHighSpec}` : '-'}</td>
                  <td className="px-4 py-4 text-center bg-indigo-50/10 text-teal-600 font-medium">{item.newNb > 0 ? `+${item.newNb}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        IT Inventory Dashboard v1 • กรมวิทยาศาสตร์บริการ สทว. ศบท. & ศทป.
      </div>
    </div>
  );
}