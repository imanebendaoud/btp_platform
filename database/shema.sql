-- =========================================================
-- BASE DE DONNÉES : BTP PLATFORM
-- PostgreSQL
-- =========================================================

-- =========================================================
-- 1. ROLES
-- =========================================================

CREATE TABLE roles (
    id_role BIGSERIAL PRIMARY KEY,
    nom_role VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);


-- =========================================================
-- 2. UTILISATEURS
-- =========================================================

CREATE TABLE utilisateurs (
    id_utilisateur BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe TEXT NOT NULL,
    id_role BIGINT NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_utilisateur_role
        FOREIGN KEY (id_role)
        REFERENCES roles(id_role)
);


-- =========================================================
-- 3. PROJETS
-- =========================================================

CREATE TABLE projets (
    id_projet BIGSERIAL PRIMARY KEY,
    numero_projet VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    client VARCHAR(255),
    localisation TEXT,
    date_debut DATE,
    date_fin_prevue DATE,
    budget_initial NUMERIC(15,2) NOT NULL DEFAULT 0,
    id_chef_projet BIGINT,
    statut VARCHAR(30) NOT NULL DEFAULT 'EN_PREPARATION',

    CONSTRAINT fk_projet_chef
        FOREIGN KEY (id_chef_projet)
        REFERENCES utilisateurs(id_utilisateur),

    CONSTRAINT check_projet_statut
        CHECK (
            statut IN (
                'EN_PREPARATION',
                'EN_COURS',
                'SUSPENDU',
                'TERMINE'
            )
        )
);


-- =========================================================
-- 4. TACHES
-- =========================================================

CREATE TABLE taches (
    id_tache BIGSERIAL PRIMARY KEY,
    id_projet BIGINT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_debut DATE,
    date_fin_prevue DATE,
    date_fin_reelle DATE,
    statut VARCHAR(30),
    priorite VARCHAR(20),

    CONSTRAINT fk_tache_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE
);


-- =========================================================
-- 5. AVANCEMENTS
-- =========================================================

CREATE TABLE avancements (
    id_avancement BIGSERIAL PRIMARY KEY,
    id_projet BIGINT NOT NULL,
    pourcentage NUMERIC(5,2) NOT NULL,
    date_avancement DATE NOT NULL,
    commentaire TEXT,

    CONSTRAINT fk_avancement_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE,

    CONSTRAINT check_pourcentage
        CHECK (pourcentage >= 0 AND pourcentage <= 100)
);


-- =========================================================
-- 6. RAPPORTS_CHANTIER
-- =========================================================

CREATE TABLE rapports_chantier (
    id_rapport BIGSERIAL PRIMARY KEY,
    id_projet BIGINT NOT NULL,
    id_utilisateur BIGINT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    type_rapport VARCHAR(100),
    contenu TEXT,
    date_rapport TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rapport_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE,

    CONSTRAINT fk_rapport_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
);


-- =========================================================
-- 7. PHOTOS
-- =========================================================

CREATE TABLE photos (
    id_photo BIGSERIAL PRIMARY KEY,
    id_projet BIGINT NOT NULL,
    chemin_photo TEXT NOT NULL,
    description TEXT,
    date_ajout TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_photo_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE
);


-- =========================================================
-- 8. EMPLOYES
-- =========================================================

CREATE TABLE employes (
    id_employe BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    cin VARCHAR(30) UNIQUE,
    telephone VARCHAR(30),
    email VARCHAR(255),
    poste VARCHAR(100),
    date_embauche DATE,
    cout_journalier NUMERIC(15,2),
    statut VARCHAR(30)
);


-- =========================================================
-- 9. AFFECTATIONS_EMPLOYES
-- =========================================================

CREATE TABLE affectations_employes (
    id_affectation BIGSERIAL PRIMARY KEY,
    id_employe BIGINT NOT NULL,
    id_projet BIGINT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    fonction_sur_chantier VARCHAR(100),
    cout_journalier NUMERIC(15,2),

    CONSTRAINT fk_affectation_employe
        FOREIGN KEY (id_employe)
        REFERENCES employes(id_employe),

    CONSTRAINT fk_affectation_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE
);


-- =========================================================
-- 10. CONTRATS
-- =========================================================

CREATE TABLE contrats (
    id_contrat BIGSERIAL PRIMARY KEY,
    id_employe BIGINT NOT NULL,
    type_contrat VARCHAR(50) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    salaire NUMERIC(15,2),
    statut VARCHAR(30),

    CONSTRAINT fk_contrat_employe
        FOREIGN KEY (id_employe)
        REFERENCES employes(id_employe)
);


-- =========================================================
-- 11. CONGES_ABSENCES
-- =========================================================

CREATE TABLE conges_absences (
    id_absence BIGSERIAL PRIMARY KEY,
    id_employe BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    motif TEXT,
    statut VARCHAR(30),

    CONSTRAINT fk_absence_employe
        FOREIGN KEY (id_employe)
        REFERENCES employes(id_employe)
);


-- =========================================================
-- 12. POINTAGES
-- =========================================================

CREATE TABLE pointages (
    id_pointage BIGSERIAL PRIMARY KEY,
    id_employe BIGINT NOT NULL,
    id_projet BIGINT NOT NULL,
    date DATE NOT NULL,
    heure_entree TIME,
    heure_sortie TIME,

    CONSTRAINT fk_pointage_employe
        FOREIGN KEY (id_employe)
        REFERENCES employes(id_employe),

    CONSTRAINT fk_pointage_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE
);


-- =========================================================
-- 13. FOURNISSEURS
-- =========================================================

CREATE TABLE fournisseurs (
    id_fournisseur BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(30),
    email VARCHAR(255),
    adresse TEXT,
    registre_commerce VARCHAR(100),
    identifiant_fiscal VARCHAR(100),
    ice VARCHAR(100),
    date_creation DATE DEFAULT CURRENT_DATE
);


-- =========================================================
-- 14. MATERIAUX
-- =========================================================

CREATE TABLE materiaux (
    id_materiau BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    unite VARCHAR(50) NOT NULL,
    stock_actuel NUMERIC(15,3) NOT NULL DEFAULT 0,
    stock_minimum NUMERIC(15,3) NOT NULL DEFAULT 0
);


-- =========================================================
-- 15. ACHATS
-- =========================================================

CREATE TABLE achats (
    id_achat BIGSERIAL PRIMARY KEY,
    reference VARCHAR(100) NOT NULL UNIQUE,
    id_projet BIGINT NOT NULL,
    id_fournisseur BIGINT NOT NULL,
    id_materiau BIGINT NOT NULL,
    quantite NUMERIC(15,3) NOT NULL,
    unite VARCHAR(50),
    prix_unitaire NUMERIC(15,2) NOT NULL,
    montant_total NUMERIC(15,2) NOT NULL,
    date_achat DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30),
    facture TEXT,

    CONSTRAINT fk_achat_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet),

    CONSTRAINT fk_achat_fournisseur
        FOREIGN KEY (id_fournisseur)
        REFERENCES fournisseurs(id_fournisseur),

    CONSTRAINT fk_achat_materiau
        FOREIGN KEY (id_materiau)
        REFERENCES materiaux(id_materiau),

    CONSTRAINT check_quantite_achat
        CHECK (quantite > 0),

    CONSTRAINT check_prix_achat
        CHECK (prix_unitaire >= 0)
);


-- =========================================================
-- 16. MOUVEMENTS_STOCK
-- =========================================================

CREATE TABLE mouvements_stock (
    id_mouvement BIGSERIAL PRIMARY KEY,
    id_materiau BIGINT NOT NULL,
    id_projet BIGINT,
    type_mouvement VARCHAR(20) NOT NULL,
    quantite NUMERIC(15,3) NOT NULL,
    date_mouvement TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motif TEXT,

    CONSTRAINT fk_mouvement_materiau
        FOREIGN KEY (id_materiau)
        REFERENCES materiaux(id_materiau),

    CONSTRAINT fk_mouvement_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet),

    CONSTRAINT check_type_mouvement
        CHECK (
            type_mouvement IN (
                'ENTREE',
                'SORTIE',
                'AJUSTEMENT'
            )
        ),

    CONSTRAINT check_quantite_mouvement
        CHECK (quantite > 0)
);


-- =========================================================
-- 17. BUDGETS
-- =========================================================

CREATE TABLE budgets (
    id_budget BIGSERIAL PRIMARY KEY,
    id_projet BIGINT NOT NULL UNIQUE,
    montant_main_oeuvre NUMERIC(15,2) NOT NULL DEFAULT 0,
    montant_materiaux NUMERIC(15,2) NOT NULL DEFAULT 0,
    montant_equipements NUMERIC(15,2) NOT NULL DEFAULT 0,
    montant_sous_traitance NUMERIC(15,2) NOT NULL DEFAULT 0,
    montant_transport NUMERIC(15,2) NOT NULL DEFAULT 0,
    montant_divers NUMERIC(15,2) NOT NULL DEFAULT 0,
    montant_total NUMERIC(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_budget_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE
);


-- =========================================================
-- 18. DEPENSES
-- =========================================================

CREATE TABLE depenses (
    id_depense BIGSERIAL PRIMARY KEY,
    id_projet BIGINT NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    description TEXT,
    montant NUMERIC(15,2) NOT NULL,
    date_depense DATE NOT NULL DEFAULT CURRENT_DATE,
    justification TEXT,
    piece_justificative TEXT,

    CONSTRAINT fk_depense_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE,

    CONSTRAINT check_montant_depense
        CHECK (montant >= 0)
);


-- =========================================================
-- 19. EQUIPEMENTS
-- =========================================================

CREATE TABLE equipements (
    id_equipement BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    marque VARCHAR(100),
    modele VARCHAR(100),
    date_acquisition DATE,
    etat VARCHAR(50),
    disponibilite VARCHAR(50)
);


-- =========================================================
-- 20. AFFECTATIONS_EQUIPEMENTS
-- =========================================================

CREATE TABLE affectations_equipements (
    id_affectation BIGSERIAL PRIMARY KEY,
    id_equipement BIGINT NOT NULL,
    id_projet BIGINT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,

    CONSTRAINT fk_affectation_equipement
        FOREIGN KEY (id_equipement)
        REFERENCES equipements(id_equipement),

    CONSTRAINT fk_affectation_equipement_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE
);


-- =========================================================
-- 21. MAINTENANCES
-- =========================================================

CREATE TABLE maintenances (
    id_maintenance BIGSERIAL PRIMARY KEY,
    id_equipement BIGINT NOT NULL,
    type_intervention VARCHAR(100),
    description TEXT,
    date_declaration DATE NOT NULL,
    date_planifiee DATE,
    date_intervention DATE,
    cout NUMERIC(15,2),
    statut VARCHAR(50),
    technicien VARCHAR(255),

    CONSTRAINT fk_maintenance_equipement
        FOREIGN KEY (id_equipement)
        REFERENCES equipements(id_equipement)
);


-- =========================================================
-- 22. DOCUMENTS
-- =========================================================

CREATE TABLE documents (
    id_document BIGSERIAL PRIMARY KEY,
    id_projet BIGINT NOT NULL,
    id_utilisateur BIGINT NOT NULL,
    nom_document VARCHAR(255) NOT NULL,
    type_document VARCHAR(100),
    chemin_fichier TEXT NOT NULL,
    date_ajout TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
        ON DELETE CASCADE,

    CONSTRAINT fk_document_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur)
);


-- =========================================================
-- 23. NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    id_notification BIGSERIAL PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL,
    id_projet BIGINT,
    type VARCHAR(100),
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lue BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_notification_utilisateur
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id_utilisateur),

    CONSTRAINT fk_notification_projet
        FOREIGN KEY (id_projet)
        REFERENCES projets(id_projet)
);