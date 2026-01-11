import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Loader2, 
  Upload, 
  FileSpreadsheet, 
  Download,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  roll_number: string;
  register_number: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  department: string | null;
  section: string | null;
  batch_year: number | null;
  current_semester: number | null;
  admission_year: number | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  blood_group: string | null;
  is_active: boolean;
}

const sections = ['A', 'B', 'C', 'D'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const currentYear = new Date().getFullYear();
const batchYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
const genders = ['Male', 'Female', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Student | null>(null);
  const [uploadedData, setUploadedData] = useState<Partial<Student>[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterBatch, setFilterBatch] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    roll_number: '',
    register_number: '',
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    section: '',
    batch_year: '',
    current_semester: '',
    admission_year: '',
    parent_name: '',
    parent_phone: '',
    address: '',
    blood_group: '',
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('roll_number');

    if (error) {
      toast.error('Failed to load students');
      console.error(error);
    } else {
      setStudents(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      roll_number: '',
      register_number: '',
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      section: '',
      batch_year: '',
      current_semester: '',
      admission_year: '',
      parent_name: '',
      parent_phone: '',
      address: '',
      blood_group: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Student) => {
    setSelectedItem(item);
    setFormData({
      roll_number: item.roll_number,
      register_number: item.register_number || '',
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      date_of_birth: item.date_of_birth || '',
      gender: item.gender || '',
      section: item.section || '',
      batch_year: item.batch_year?.toString() || '',
      current_semester: item.current_semester?.toString() || '',
      admission_year: item.admission_year?.toString() || '',
      parent_name: item.parent_name || '',
      parent_phone: item.parent_phone || '',
      address: item.address || '',
      blood_group: item.blood_group || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Student) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = async (item: Student) => {
    const { error } = await supabase
      .from('students')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Student ${item.is_active ? 'deactivated' : 'activated'}`);
      fetchStudents();
    }
  };

  const handleSave = async () => {
    if (!formData.roll_number.trim() || !formData.name.trim()) {
      toast.error('Roll number and name are required');
      return;
    }

    setIsSaving(true);

    const payload = {
      roll_number: formData.roll_number,
      register_number: formData.register_number || null,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      date_of_birth: formData.date_of_birth || null,
      gender: formData.gender || null,
      department: 'CSE',
      section: formData.section || null,
      batch_year: formData.batch_year ? parseInt(formData.batch_year) : null,
      current_semester: formData.current_semester ? parseInt(formData.current_semester) : null,
      admission_year: formData.admission_year ? parseInt(formData.admission_year) : null,
      parent_name: formData.parent_name || null,
      parent_phone: formData.parent_phone || null,
      address: formData.address || null,
      blood_group: formData.blood_group || null,
    };

    if (selectedItem) {
      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', selectedItem.id);

      if (error) {
        toast.error('Failed to update student: ' + error.message);
      } else {
        toast.success('Student updated successfully');
        setIsDialogOpen(false);
        fetchStudents();
      }
    } else {
      const { error } = await supabase.from('students').insert(payload);

      if (error) {
        if (error.code === '23505') {
          toast.error('Roll number or register number already exists');
        } else {
          toast.error('Failed to add student: ' + error.message);
        }
      } else {
        toast.success('Student added successfully');
        setIsDialogOpen(false);
        fetchStudents();
      }
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', selectedItem.id);

    if (error) {
      toast.error('Failed to delete student');
    } else {
      toast.success('Student deleted successfully');
      fetchStudents();
    }
    setIsDeleteDialogOpen(false);
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadErrors([]);
    setUploadedData([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const errors: string[] = [];
      const parsedData: Partial<Student>[] = [];

      jsonData.forEach((row: any, index) => {
        const rowNum = index + 2; // Excel row number (1-indexed + header)
        
        // Required fields validation
        if (!row.roll_number && !row.Roll_Number && !row['Roll Number']) {
          errors.push(`Row ${rowNum}: Roll number is required`);
          return;
        }
        if (!row.name && !row.Name && !row['Student Name']) {
          errors.push(`Row ${rowNum}: Name is required`);
          return;
        }

        // Parse date of birth
        let dob = row.date_of_birth || row.Date_of_Birth || row['Date of Birth'] || row.DOB || '';
        if (dob && typeof dob === 'number') {
          // Excel date serial number
          const date = XLSX.SSF.parse_date_code(dob);
          dob = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }

        parsedData.push({
          roll_number: String(row.roll_number || row.Roll_Number || row['Roll Number'] || '').trim(),
          register_number: String(row.register_number || row.Register_Number || row['Register Number'] || '').trim() || null,
          name: String(row.name || row.Name || row['Student Name'] || '').trim(),
          email: String(row.email || row.Email || '').trim() || null,
          phone: String(row.phone || row.Phone || row.Mobile || '').trim() || null,
          date_of_birth: dob || null,
          gender: String(row.gender || row.Gender || '').trim() || null,
          section: String(row.section || row.Section || '').trim() || null,
          batch_year: parseInt(row.batch_year || row.Batch_Year || row['Batch Year'] || row.Batch) || null,
          current_semester: parseInt(row.current_semester || row.Semester || row['Current Semester']) || null,
          admission_year: parseInt(row.admission_year || row.Admission_Year || row['Admission Year']) || null,
          parent_name: String(row.parent_name || row.Parent_Name || row['Parent Name'] || row['Father Name'] || '').trim() || null,
          parent_phone: String(row.parent_phone || row.Parent_Phone || row['Parent Phone'] || '').trim() || null,
          address: String(row.address || row.Address || '').trim() || null,
          blood_group: String(row.blood_group || row.Blood_Group || row['Blood Group'] || '').trim() || null,
          department: 'CSE',
        });
      });

      setUploadErrors(errors);
      setUploadedData(parsedData);
      setIsUploadDialogOpen(true);
    } catch (err) {
      console.error('Error parsing file:', err);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  }, []);

  const handleBulkUpload = async () => {
    if (uploadedData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const student of uploadedData) {
      const { error } = await supabase.from('students').insert({
        roll_number: student.roll_number,
        register_number: student.register_number,
        name: student.name,
        email: student.email,
        phone: student.phone,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        department: student.department,
        section: student.section,
        batch_year: student.batch_year,
        current_semester: student.current_semester,
        admission_year: student.admission_year,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        address: student.address,
        blood_group: student.blood_group,
        is_active: true,
      });

      if (error) {
        errorCount++;
        if (error.code === '23505') {
          errors.push(`${student.roll_number}: Already exists`);
        } else {
          errors.push(`${student.roll_number}: ${error.message}`);
        }
      } else {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} students`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to add ${errorCount} students`);
      setUploadErrors(errors);
    } else {
      setIsUploadDialogOpen(false);
      setUploadedData([]);
    }
    
    fetchStudents();
    setIsUploading(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        roll_number: '21CSE001',
        register_number: '311421104001',
        name: 'Sample Student',
        email: 'student@example.com',
        phone: '9876543210',
        date_of_birth: '2003-05-15',
        gender: 'Male',
        section: 'A',
        batch_year: 2021,
        current_semester: 6,
        admission_year: 2021,
        parent_name: 'Parent Name',
        parent_phone: '9876543211',
        address: 'Address',
        blood_group: 'O+',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_upload_template.xlsx');
    toast.success('Template downloaded');
  };

  const filteredStudents = students.filter((s) => {
    if (filterSection !== 'all' && s.section !== filterSection) return false;
    if (filterBatch !== 'all' && s.batch_year?.toString() !== filterBatch) return false;
    return true;
  });

  const columns: Column<Student>[] = [
    {
      key: 'name',
      label: 'Student',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">{item.name}</span>
            <p className="text-xs text-muted-foreground">{item.roll_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'section',
      label: 'Section',
      render: (item) => (
        <Badge variant="secondary">{item.section || '-'}</Badge>
      ),
    },
    {
      key: 'batch_year',
      label: 'Batch',
      render: (item) => item.batch_year || '-',
    },
    {
      key: 'current_semester',
      label: 'Semester',
      render: (item) => item.current_semester ? `Sem ${item.current_semester}` : '-',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'actions', label: 'Actions', className: 'w-32' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="heading-section text-foreground mb-2">
          <span className="text-primary">Student</span> Management
        </h1>
        <p className="text-muted-foreground">
          Manage student records - add individually or upload in bulk
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Student List</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
        </TabsList>

        {/* Student List Tab */}
        <TabsContent value="list">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s} value={s}>Section {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterBatch} onValueChange={setFilterBatch}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batchYears.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{filteredStudents.length} students</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable
              data={filteredStudents}
              columns={columns}
              onAdd={handleAdd}
              addLabel="Add Student"
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleActive}
              searchKey="name"
              searchPlaceholder="Search students..."
              emptyMessage="No students found. Add students individually or upload in bulk."
            />
          )}
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="upload">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Excel/CSV
                </CardTitle>
                <CardDescription>
                  Upload a spreadsheet with student data. Download the template first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    {isUploading ? (
                      <Loader2 className="w-12 h-12 text-muted-foreground animate-spin mb-4" />
                    ) : (
                      <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-4" />
                    )}
                    <p className="font-medium">
                      {isUploading ? 'Processing...' : 'Click to upload'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Excel (.xlsx, .xls) or CSV files
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Columns</CardTitle>
                <CardDescription>
                  Your file must have these columns (case-insensitive)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>roll_number</strong> (Required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>name</strong> (Required)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center">○</span>
                    <span>register_number</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center">○</span>
                    <span>email, phone</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center">○</span>
                    <span>date_of_birth, gender</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center">○</span>
                    <span>section, batch_year, current_semester</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center">○</span>
                    <span>parent_name, parent_phone, address</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? 'Update the student details below'
                : 'Fill in the student details'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roll_number">Roll Number *</Label>
              <Input
                id="roll_number"
                value={formData.roll_number}
                onChange={(e) =>
                  setFormData({ ...formData, roll_number: e.target.value })
                }
                placeholder="e.g., 21CSE001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register_number">Register Number</Label>
              <Input
                id="register_number"
                value={formData.register_number}
                onChange={(e) =>
                  setFormData({ ...formData, register_number: e.target.value })
                }
                placeholder="e.g., 311421104001"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Student full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="student@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={formData.section}
                onValueChange={(value) =>
                  setFormData({ ...formData, section: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>Section {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Batch Year</Label>
              <Select
                value={formData.batch_year}
                onValueChange={(value) =>
                  setFormData({ ...formData, batch_year: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batchYears.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Current Semester</Label>
              <Select
                value={formData.current_semester}
                onValueChange={(value) =>
                  setFormData({ ...formData, current_semester: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select
                value={formData.blood_group}
                onValueChange={(value) =>
                  setFormData({ ...formData, blood_group: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_name">Parent Name</Label>
              <Input
                id="parent_name"
                value={formData.parent_name}
                onChange={(e) =>
                  setFormData({ ...formData, parent_name: e.target.value })
                }
                placeholder="Parent/Guardian name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_phone">Parent Phone</Label>
              <Input
                id="parent_phone"
                value={formData.parent_phone}
                onChange={(e) =>
                  setFormData({ ...formData, parent_phone: e.target.value })
                }
                placeholder="9876543211"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Full address"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedItem ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Upload Data</DialogTitle>
            <DialogDescription>
              {uploadedData.length} students found in the file
            </DialogDescription>
          </DialogHeader>

          {uploadErrors.length > 0 && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Errors Found
              </h4>
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {uploadErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="border rounded-lg max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary sticky top-0">
                <tr>
                  <th className="p-2 text-left">Roll No</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Section</th>
                  <th className="p-2 text-left">Batch</th>
                </tr>
              </thead>
              <tbody>
                {uploadedData.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{s.roll_number}</td>
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.section || '-'}</td>
                    <td className="p-2">{s.batch_year || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={isUploading || uploadedData.length === 0}
            >
              {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Upload {uploadedData.length} Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedItem?.name}" ({selectedItem?.roll_number}). 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
