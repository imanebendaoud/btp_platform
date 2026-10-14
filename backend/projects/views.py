
import os

from io import BytesIO

from rest_framework import viewsets

from rest_framework.decorators import action

from rest_framework.exceptions import PermissionDenied, ValidationError

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from django.utils import timezone

from django.http import HttpResponse

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted

from pypdf import PdfReader

from docx import Document as WordDocument

from openpyxl import load_workbook

import xlrd

from .models import (

    Projet,

    Tache,

    Avancement,

    RapportChantier,

    Photo,

    Document,

    Notification,

)

from .serializers import (

    ProjetSerializer,

    TacheSerializer,

    AvancementSerializer,

    RapportChantierSerializer,

    PhotoSerializer,

    DocumentSerializer,

    NotificationSerializer,

)

from users.permissions import (

    IsActionAllowed,

    IsOwnProject,

    check_project_access,

)

# ============================================================

# PROJETS

# ============================================================

class ProjetViewSet(viewsets.ModelViewSet):

    queryset = Projet.objects.all()

    serializer_class = ProjetSerializer

    permission_classes = [IsActionAllowed, IsOwnProject]

    action_roles = {

        "list": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "retrieve": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "create": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "partial_update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "destroy": ["ADMINISTRATEUR"],

    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"]:

            return Projet.objects.all()

        if role == "CHEF_CHANTIER":

            return Projet.objects.filter(

                id_chef_projet_id=user.id_utilisateur

            )

        return Projet.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        role = user.id_role.nom_role

        if role == "CHEF_CHANTIER":

            serializer.save(id_chef_projet=user)

        else:

            serializer.save()

    def perform_update(self, serializer):

        user = self.request.user

        role = user.id_role.nom_role

        if role == "CHEF_CHANTIER":

            serializer.save(id_chef_projet=user)

        else:

            serializer.save()

# ============================================================

# TACHES

# ============================================================

class TacheViewSet(viewsets.ModelViewSet):

    queryset = Tache.objects.all()

    serializer_class = TacheSerializer

    permission_classes = [IsActionAllowed]

    action_roles = {

        "list": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "retrieve": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "create": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "partial_update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "destroy": ["ADMINISTRATEUR"],

    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"]:

            return Tache.objects.all()

        if role == "CHEF_CHANTIER":

            return Tache.objects.filter(

                id_projet__id_chef_projet_id=user.id_utilisateur

            )

        return Tache.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:

            raise PermissionDenied("Le projet est obligatoire.")

        if not check_project_access(user, projet):

            raise PermissionDenied(

                "Vous ne pouvez pas créer une tâche sur ce chantier."

            )

        serializer.save()

# ============================================================

# AVANCEMENTS

# ============================================================

class AvancementViewSet(viewsets.ModelViewSet):

    queryset = Avancement.objects.all()

    serializer_class = AvancementSerializer

    permission_classes = [IsActionAllowed]

    action_roles = {

        "list": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "retrieve": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "create": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "partial_update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "destroy": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"]:

            return Avancement.objects.all()

        if role == "CHEF_CHANTIER":

            return Avancement.objects.filter(

                id_projet__id_chef_projet_id=user.id_utilisateur

            )

        return Avancement.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:

            raise PermissionDenied("Le projet est obligatoire.")

        if not check_project_access(user, projet):

            raise PermissionDenied(

                "Vous ne pouvez pas ajouter un avancement sur ce chantier."

            )

        serializer.save()

# ============================================================

# RAPPORTS DE CHANTIER

# ============================================================

class RapportChantierViewSet(viewsets.ModelViewSet):

    queryset = RapportChantier.objects.all()

    serializer_class = RapportChantierSerializer

    permission_classes = [IsActionAllowed]

    action_roles = {

        "list": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "retrieve": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "create": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "partial_update": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "destroy": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"]:

            return RapportChantier.objects.all()

        if role == "CHEF_CHANTIER":

            return RapportChantier.objects.filter(

                id_projet__id_chef_projet_id=user.id_utilisateur,

                id_utilisateur_id=user.id_utilisateur,

            )

        return RapportChantier.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:

            raise PermissionDenied("Le projet est obligatoire.")

        if not check_project_access(user, projet):

            raise PermissionDenied(

                "Vous ne pouvez pas créer un rapport sur ce chantier."

            )

        serializer.save(id_utilisateur=user)

# ============================================================

# PHOTOS

# ============================================================

class PhotoViewSet(viewsets.ModelViewSet):

    queryset = Photo.objects.all()

    serializer_class = PhotoSerializer

    parser_classes = [

        MultiPartParser,

        FormParser,

        JSONParser,

    ]

    permission_classes = [IsActionAllowed]

    action_roles = {

        "list": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "retrieve": ["ADMINISTRATEUR", "CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],

        "create": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

        "update": ["ADMINISTRATEUR"],

        "partial_update": ["ADMINISTRATEUR"],

        "destroy": ["ADMINISTRATEUR", "CHEF_CHANTIER"],

    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"]:

            return Photo.objects.all()

        if role == "CHEF_CHANTIER":

            return Photo.objects.filter(

                id_projet__id_chef_projet_id=user.id_utilisateur

            )

        return Photo.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:

            raise PermissionDenied("Le projet est obligatoire.")

        if not check_project_access(user, projet):

            raise PermissionDenied(

                "Vous ne pouvez pas ajouter une photo sur ce chantier."

            )

        serializer.save()

# ============================================================

# DOCUMENTS

# ============================================================

class DocumentViewSet(viewsets.ModelViewSet):

    queryset = Document.objects.all()

    serializer_class = DocumentSerializer

    parser_classes = [

        MultiPartParser,

        FormParser,

        JSONParser,

    ]

    permission_classes = [IsActionAllowed]

    action_roles = {

        "list": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

            "RESPONSABLE_FINANCIER",

        ],

        "retrieve": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

            "RESPONSABLE_FINANCIER",

        ],

        "create": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

        ],

        "update": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

        ],

        "partial_update": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

        ],

        "destroy": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

        ],

        "download_txt": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

            "RESPONSABLE_FINANCIER",

        ],

    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in [

            "ADMINISTRATEUR",

            "RESPONSABLE_FINANCIER",

        ]:

            return Document.objects.all()

        if role == "CHEF_CHANTIER":

            return Document.objects.filter(

                id_projet__id_chef_projet_id=user.id_utilisateur

            )

        return Document.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:

            raise PermissionDenied(

                "Le projet est obligatoire."

            )

        if not check_project_access(user, projet):

            raise PermissionDenied(

                "Vous ne pouvez pas ajouter un document sur ce chantier."

            )

        serializer.save(

            id_utilisateur=user,

            date_ajout=timezone.now(),

        )

    # --------------------------------------------------------

    # CONVERSION ET TELECHARGEMENT DU DOCUMENT EN TXT

    # GET /api/projects/documents/<id>/download-txt/

    # --------------------------------------------------------

    @action(

        detail=True,

        methods=["get"],

        url_path="download-txt",

        url_name="download-txt",

    )

    def download_txt(self, request, pk=None):

        # get_object() applique le queryset du rôle :

        # le chef ne peut accéder qu'aux documents de ses chantiers.

        document = self.get_object()

        if not document.chemin_fichier:

            raise ValidationError({

                "detail": "Aucun fichier n'est associé à ce document."

            })

        filename = os.path.basename(document.chemin_fichier.name)

        extension = os.path.splitext(filename)[1].lower()

        try:

            document.chemin_fichier.open("rb")

            try:

                file_bytes = document.chemin_fichier.read()

            finally:

                document.chemin_fichier.close()

            text_content = ""

            # TXT

            if extension == ".txt":

                try:

                    text_content = file_bytes.decode("utf-8-sig")

                except UnicodeDecodeError:

                    text_content = file_bytes.decode("cp1252")

            # PDF

            elif extension == ".pdf":

                reader = PdfReader(BytesIO(file_bytes))

                if reader.is_encrypted:

                    raise ValidationError({

                        "detail": "Ce PDF est protégé par un mot de passe."

                    })

                pages = [

                    page.extract_text() or ""

                    for page in reader.pages

                ]

                text_content = "\n\n".join(pages)

            # WORD DOCX

            elif extension == ".docx":

                word_file = WordDocument(BytesIO(file_bytes))

                paragraphs = [

                    paragraph.text

                    for paragraph in word_file.paragraphs

                    if paragraph.text.strip()

                ]

                tables_text = []

                for table in word_file.tables:

                    for row in table.rows:

                        tables_text.append(

                            " | ".join(cell.text for cell in row.cells)

                        )

                text_content = "\n".join(

                    paragraphs + tables_text

                )

            # EXCEL XLSX

            elif extension == ".xlsx":

                workbook = load_workbook(

                    BytesIO(file_bytes),

                    read_only=True,

                    data_only=True,

                )

                try:

                    sheets_text = []

                    for sheet in workbook.worksheets:

                        sheets_text.append(

                            f"Feuille : {sheet.title}"

                        )

                        for row in sheet.iter_rows(values_only=True):

                            values = [

                                "" if value is None else str(value)

                                for value in row

                            ]

                            if any(value.strip() for value in values):

                                sheets_text.append(

                                    "\t".join(values)

                                )

                    text_content = "\n".join(sheets_text)

                finally:

                    workbook.close()

            # EXCEL XLS

            elif extension == ".xls":

                workbook = xlrd.open_workbook(

                    file_contents=file_bytes

                )

                sheets_text = []

                for sheet in workbook.sheets():

                    sheets_text.append(

                        f"Feuille : {sheet.name}"

                    )

                    for row_index in range(sheet.nrows):

                        values = [

                            str(value)

                            for value in sheet.row_values(row_index)

                        ]

                        if any(value.strip() for value in values):

                            sheets_text.append(

                                "\t".join(values)

                            )

                text_content = "\n".join(sheets_text)

            # FORMAT NON PRIS EN CHARGE

            else:

                raise ValidationError({

                    "detail": (

                        "Ce format n'est pas pris en charge pour "

                        "la conversion TXT. Formats pris en charge : "

                        "PDF, DOCX, XLSX, XLS et TXT. "

                        "Les fichiers DOC doivent être convertis "

                        "en DOCX au préalable."

                    )

                })

        except ValidationError:

            raise

        except Exception:

            raise ValidationError({

                "detail": (

                    "Impossible de lire ce fichier. Il est peut-être "

                    "endommagé, protégé ou dans un format non pris "

                    "en charge."

                )

            })

        response = HttpResponse(

            text_content,

            content_type="text/plain; charset=utf-8",

        )

        response["Content-Disposition"] = (

            'attachment; filename="document.txt"'

        )

        return response

# ============================================================

# NOTIFICATIONS

# ============================================================

    # --------------------------------------------------------
    # TELECHARGEMENT / CONVERSION DU DOCUMENT EN PDF
    # GET /api/projects/documents/<id>/download-pdf/
    # --------------------------------------------------------

    @action(detail=True, methods=["get"], url_path="download-pdf", url_name="download-pdf")
    def download_pdf(self, request, pk=None):
        document = self.get_object()
        if not document.chemin_fichier:
            raise ValidationError({"detail": "Aucun fichier n'est associé à ce document."})

        filename = os.path.basename(document.chemin_fichier.name)
        extension = os.path.splitext(filename)[1].lower()
        try:
            document.chemin_fichier.open("rb")
            try:
                file_bytes = document.chemin_fichier.read()
            finally:
                document.chemin_fichier.close()

            if extension == ".pdf":
                response = HttpResponse(file_bytes, content_type="application/pdf")
                response["Content-Disposition"] = 'attachment; filename="document.pdf"'
                return response
            if extension == ".txt":
                try:
                    text_content = file_bytes.decode("utf-8-sig")
                except UnicodeDecodeError:
                    text_content = file_bytes.decode("cp1252")
            elif extension == ".docx":
                word_file = WordDocument(BytesIO(file_bytes))
                text_content = "\n".join(p.text for p in word_file.paragraphs)
            elif extension == ".xlsx":
                workbook = load_workbook(BytesIO(file_bytes), read_only=True, data_only=True)
                try:
                    lines = []
                    for sheet in workbook.worksheets:
                        lines.append(f"Feuille : {sheet.title}")
                        for row in sheet.iter_rows(values_only=True):
                            values = ["" if value is None else str(value) for value in row]
                            if any(value.strip() for value in values):
                                lines.append("    ".join(values))
                    text_content = "\n".join(lines)
                finally:
                    workbook.close()
            elif extension == ".xls":
                workbook = xlrd.open_workbook(file_contents=file_bytes)
                lines = []
                for sheet in workbook.sheets():
                    lines.append(f"Feuille : {sheet.name}")
                    for row_index in range(sheet.nrows):
                        values = [str(value) for value in sheet.row_values(row_index)]
                        if any(value.strip() for value in values):
                            lines.append("    ".join(values))
                text_content = "\n".join(lines)
            else:
                raise ValidationError({"detail": "Formats pris en charge : PDF, TXT, DOCX, XLSX et XLS."})

            pdf_buffer = BytesIO()
            pdf_doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
            styles = getSampleStyleSheet()
            story = [Paragraph("Document converti", styles["Title"]), Spacer(1, 12)]
            for line in text_content.splitlines() or [""]:
                safe_line = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Preformatted(safe_line, styles["Code"], maxLineLength=95))
            pdf_doc.build(story)
            response = HttpResponse(pdf_buffer.getvalue(), content_type="application/pdf")
            response["Content-Disposition"] = 'attachment; filename="document.pdf"'
            return response
        except ValidationError:
            raise
        except Exception:
            raise ValidationError({"detail": "Impossible de convertir ce fichier en PDF. Vérifiez qu'il n'est pas endommagé."})


class NotificationViewSet(viewsets.ModelViewSet):

    queryset = Notification.objects.all()

    serializer_class = NotificationSerializer

    permission_classes = [IsActionAllowed]

    action_roles = {

        "list": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

            "RESPONSABLE_FINANCIER",

            "RESPONSABLE_MAINTENANCE",

            "RESPONSABLE_RH",

        ],

        "retrieve": [

            "ADMINISTRATEUR",

            "CHEF_CHANTIER",

            "RESPONSABLE_FINANCIER",

            "RESPONSABLE_MAINTENANCE",

            "RESPONSABLE_RH",

        ],

        "create": ["ADMINISTRATEUR"],

        "update": ["ADMINISTRATEUR"],

        "partial_update": ["ADMINISTRATEUR"],

        "destroy": ["ADMINISTRATEUR"],

    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role == "ADMINISTRATEUR":

            return Notification.objects.all()

        return Notification.objects.filter(

            id_utilisateur_id=user.id_utilisateur

        )