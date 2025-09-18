import React, { useState, useEffect, useCallback } from 'react';
import {
    Upload,
    Download,
    Trash2,
    FileText,
    Search,
    User,
    AlertCircle,
    File,
    GraduationCap,
    Camera,
    Trophy,
    FileCheck,
    ScrollText,
    Briefcase,
    Receipt,
    CreditCard,
    Shield,
    Stethoscope,
    Folder,
    Eye,
    X
} from 'lucide-react';
import { employeService, type Employe } from '../services/api';

// Interface correspondant au type de document
interface EmployeDocument {
    id?: number;
    nom: string;
    typeDocument: string;
    description?: string;
    dateUpload: string;
    cheminFichier: string;
    tailleFichier?: number;
}

const Documents: React.FC = () => {
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
    const [documents, setDocuments] = useState<EmployeDocument[]>([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingDocument, setEditingDocument] = useState<EmployeDocument | null>(null);
    const [viewingDocument, setViewingDocument] = useState<EmployeDocument | null>(null);
    const [documentContent, setDocumentContent] = useState<string>('');
    const [documentLoading, setDocumentLoading] = useState(false);

    // Charger la liste des employés
    const loadEmployes = useCallback(async () => {
        try {
            setError(null);
            const data = await employeService.getAllEmployes();
            setEmployes(data);
            if (data.length > 0 && !selectedEmploye) setSelectedEmploye(data[0]);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des employés');
        } finally {
            setLoading(false);
        }
    }, [selectedEmploye]);

    // Charger les documents d'un employé
    const loadDocuments = useCallback(async () => {
        if (!selectedEmploye) return;
        try {
            setError(null);
            const data = await employeService.getDocuments(selectedEmploye.id);
            const formattedData: EmployeDocument[] = data.map((doc: any) => ({
                id: doc.id,
                nom: doc.nom,
                typeDocument: doc.typeDocument,
                description: doc.description || '',
                dateUpload: doc.dateUpload,
                cheminFichier: doc.cheminFichier,
                tailleFichier: doc.tailleFichier
            }));
            setDocuments(formattedData);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du chargement des documents');
        }
    }, [selectedEmploye]);

    useEffect(() => {
        loadEmployes();
    }, [loadEmployes]);

    useEffect(() => {
        if (selectedEmploye) loadDocuments();
    }, [selectedEmploye, loadDocuments]);

    // Afficher le contenu d'un document directement sur la page
// Afficher le contenu d'un document directement sur la page
    const handleViewDocument = async (document: EmployeDocument) => {
        try {
            setDocumentLoading(true);
            setViewingDocument(document);
            setDocumentContent('');

            const response = await fetch(`http://localhost:8080/api/uploads/${document.cheminFichier}`);
            if (!response.ok) throw new Error('Fichier non trouvé');

            const contentType = response.headers.get('content-type');
            const extension = document.cheminFichier.toLowerCase().split('.').pop();

            // Types supportés pour l'affichage
            const supportedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
            const supportedTextTypes = ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx'];

            if (contentType?.includes('image/') || supportedImageTypes.includes(extension || '')) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setDocumentContent(url);
            } else if (contentType?.includes('pdf') || extension === 'pdf') {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setDocumentContent(url);
            } else if (contentType?.includes('text/') || supportedTextTypes.includes(extension || '')) {
                const text = await response.text();
                setDocumentContent(text);
            } else {
                // Pour les types non supportés, proposer le téléchargement
                setError(`Type de fichier .${extension} non supporté pour l'affichage. Téléchargement automatique...`);
                setTimeout(() => handleDownload(document), 1000);
            }
        } catch (err) {
            console.error(err);
            setError('Erreur lors de l\'affichage du document');
        } finally {
            setDocumentLoading(false);
        }
    };

    // Fermer la vue du document
    const handleCloseView = () => {
        setViewingDocument(null);
        setDocumentContent('');
    };

    // Préparer la modification d'un document
    const handleEditDocument = (document: EmployeDocument) => {
        setEditingDocument(document);
        setShowUploadForm(true);
    };

    // Upload ou modification de document
    const handleUpload = async (file: File | null, documentData: Omit<EmployeDocument, 'id' | 'dateUpload' | 'cheminFichier'>) => {
        if (!selectedEmploye) return;

        setUploading(true);
        setError(null);

        try {
            if (editingDocument) {
                await employeService.updateDocument(selectedEmploye.id, editingDocument.id!, file, documentData);
            } else {
                if (!file) throw new Error('Veuillez sélectionner un fichier à uploader');
                await employeService.uploadDocument(selectedEmploye.id, file, documentData);
            }
            setShowUploadForm(false);
            setEditingDocument(null);
            await loadDocuments();
        } catch (err: any) {
            console.error(err);
            setError('Erreur lors de l\'upload ou modification du document');
        } finally {
            setUploading(false);
        }
    };

    // Supprimer un document
    const handleDelete = async (id: number) => {
        if (!selectedEmploye) return;
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            try {
                await employeService.deleteDocument(selectedEmploye.id, id);
                await loadDocuments();
            } catch (err) {
                console.error(err);
                setError('Erreur lors de la suppression du document');
            }
        }
    };

    // Télécharger un document
    const handleDownload = async (document: EmployeDocument) => {
        try {
            const response = await fetch(`http://localhost:8080/api/uploads/${document.cheminFichier}`);
            if (!response.ok) throw new Error('Fichier non trouvé');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.nom;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            setError('Erreur lors du téléchargement du document');
        }
    };

    // Icône selon type de document
    const getDocumentTypeIcon = (type: string) => {
        switch (type) {
            case 'CV': return <File className="w-6 h-6 text-blue-500" />;
            case 'DIPLOME': return <GraduationCap className="w-6 h-6 text-green-500" />;
            case 'CONTRAT': return <FileText className="w-6 h-6 text-purple-500" />;
            case 'PHOTO': return <Camera className="w-6 h-6 text-yellow-500" />;
            case 'CERTIFICAT': return <Trophy className="w-6 h-6 text-orange-500" />;
            case 'LETTRE_CREANCE': return <FileCheck className="w-6 h-6 text-indigo-500" />;
            case 'ORDINATION': return <ScrollText className="w-6 h-6 text-red-500" />;
            case 'ATTESTATION_TRAVAIL': return <Briefcase className="w-6 h-6 text-teal-500" />;
            case 'BULLETIN_PAIE': return <Receipt className="w-6 h-6 text-pink-500" />;
            case 'CIN': return <CreditCard className="w-6 h-6 text-gray-500" />;
            case 'CNAPS': return <Shield className="w-6 h-6 text-blue-700" />;
            case 'OSTIE': return <Stethoscope className="w-6 h-6 text-green-700" />;
            default: return <Folder className="w-6 h-6 text-gray-400" />;
        }
    };

    // Formater la taille de fichier
    const formatFileSize = (bytes: number = 0) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredEmployes = employes.filter(emp =>
        emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDocuments = documents.filter(doc =>
        doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.typeDocument.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-4 text-red-800">×</button>
                    </div>
                </div>
            )}

            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Gestion des documents</h2>
                    <p className="mt-2 text-sm text-gray-600">Gestion des documents des employés</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Liste des employés */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Employés</h3>
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredEmployes.map((employe) => (
                                <div
                                    key={employe.id}
                                    onClick={() => setSelectedEmploye(employe)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedEmploye?.id === employe.id
                                            ? 'bg-blue-100 border border-blue-300'
                                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {employe.photoProfil ? (
                                            <img
                                                src={`http://localhost:8080/uploads/${employe.photoProfil}`}
                                                alt={`${employe.prenom} ${employe.nom}`}
                                                className="h-8 w-8 rounded-full object-cover mr-3"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                                                {employe.prenom[0]}{employe.nom[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {employe.prenom} {employe.nom}
                                            </p>
                                            <p className="text-xs text-gray-500">{employe.matricule}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Documents et affichage */}
                <div className="lg:col-span-3">
                    {selectedEmploye ? (
                        <div className="space-y-6">
                            {/* En-tête employé */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        {selectedEmploye.photoProfil ? (
                                            <img
                                                src={`http://localhost:8080/uploads/${selectedEmploye.photoProfil}`}
                                                alt={`${selectedEmploye.prenom} ${selectedEmploye.nom}`}
                                                className="h-16 w-16 rounded-full object-cover mr-4"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                                                {selectedEmploye.prenom[0]}{selectedEmploye.nom[0]}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {selectedEmploye.prenom} {selectedEmploye.nom}
                                            </h3>
                                            <p className="text-gray-600">{selectedEmploye.matricule} • {selectedEmploye.poste}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowUploadForm(true)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Uploader
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher des documents..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Affichage du document */}
                            {viewingDocument && (
                                <div className="bg-white shadow rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {viewingDocument.nom}
                                        </h3>
                                        <button
                                            onClick={handleCloseView}
                                            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                                            title="Fermer"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {documentLoading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : documentContent ? (
                                        <div className="border rounded-lg overflow-hidden">
                                            {documentContent.startsWith('blob:') ? (
                                                viewingDocument.typeDocument === 'PHOTO' ||
                                                viewingDocument.cheminFichier.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                                    <img
                                                        src={documentContent}
                                                        alt={viewingDocument.nom}
                                                        className="w-full max-h-96 object-contain"
                                                    />
                                                ) : viewingDocument.cheminFichier.toLowerCase().endsWith('.pdf') ? (
                                                    <iframe
                                                        src={documentContent}
                                                        className="w-full h-96"
                                                        title={viewingDocument.nom}
                                                    />
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <p className="text-gray-500">Prévisualisation non disponible</p>
                                                        <button
                                                            onClick={() => handleDownload(viewingDocument)}
                                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                        >
                                                            Télécharger le fichier
                                                        </button>
                                                    </div>
                                                )
                                            ) : (
                                                <pre className="whitespace-pre-wrap bg-gray-100 p-4 max-h-96 overflow-auto">
                                                    {documentContent}
                                                </pre>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Impossible d'afficher le document</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Liste des documents */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredDocuments.map((document) => (
                                        <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center">
                                                    <span className="mr-3">{getDocumentTypeIcon(document.typeDocument)}</span>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{document.nom}</h5>
                                                        <p className="text-sm text-gray-600">{document.typeDocument}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDocument(document)}
                                                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                                                        title="Afficher"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(document)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                                        title="Télécharger"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditDocument(document)}
                                                        className="text-yellow-500 hover:text-yellow-700 p-1 rounded hover:bg-yellow-50 transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(document.id!)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {document.description && (
                                                <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-500">
                                                    Uploadé le: {new Date(document.dateUpload).toLocaleDateString('fr-FR')}
                                                </p>
                                                {document.tailleFichier && (
                                                    <span className="text-xs text-gray-400">
                                                        {formatFileSize(document.tailleFichier)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredDocuments.length === 0 && (
                                        <div className="col-span-2 text-center py-12 text-gray-500">
                                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <p>Aucun document trouvé</p>
                                            <p className="text-sm">Commencez par uploader un document</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-12 text-center">
                            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un employé</h3>
                            <p className="text-gray-600">Choisissez un employé dans la liste pour voir et gérer ses documents</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal d'upload */}
            {showUploadForm && selectedEmploye && (
                <UploadForm
                    document={editingDocument}
                    onClose={() => { setShowUploadForm(false); setEditingDocument(null); }}
                    onUpload={handleUpload}
                    uploading={uploading}
                />
            )}
        </div>
    );
};

// Composant UploadForm
const UploadForm: React.FC<{
    onClose: () => void;
    onUpload: (file: File | null, documentData: any) => void;
    uploading: boolean;
    document?: EmployeDocument | null;
}> = ({ onClose, onUpload, uploading, document }) => {
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        nom: document?.nom || '',
        typeDocument: document?.typeDocument || 'AUTRE',
        description: document?.description || ''
    });

    useEffect(() => {
        if (document) {
            setFormData({
                nom: document.nom,
                typeDocument: document.typeDocument,
                description: document.description || ''
            });
        }
    }, [document]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file || document) {
            onUpload(file, formData);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFormData(prev => ({
                ...prev,
                nom: selectedFile.name
            }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                <h3 className="text-xl font-bold mb-4">
                    {document ? 'Modifier le document' : 'Uploader un document'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du document</label>
                        <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
                        <select
                            value={formData.typeDocument}
                            onChange={(e) => setFormData({ ...formData, typeDocument: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="CV">CV</option>
                            <option value="DIPLOME">Diplôme</option>
                            <option value="CONTRAT">Contrat</option>
                            <option value="PHOTO">Photo</option>
                            <option value="CERTIFICAT">Certificat</option>
                            <option value="LETTRE_CREANCE">Lettre de créance</option>
                            <option value="ORDINATION">Ordination</option>
                            <option value="ATTESTATION_TRAVAIL">Attestation de travail</option>
                            <option value="BULLETIN_PAIE">Bulletin de paie</option>
                            <option value="CIN">CIN</option>
                            <option value="CNAPS">CNAPS</option>
                            <option value="OSTIE">OSTIE</option>
                            <option value="AUTRE">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {document ? 'Changer le fichier (optionnel)' : 'Fichier'}
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full"
                            accept="*/*"
                            required={!document}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'En cours...' : document ? 'Modifier' : 'Uploader'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// @ts-ignore
export default Documents;