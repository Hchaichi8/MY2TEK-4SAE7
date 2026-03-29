#ifndef RECHERCHE_H
#define RECHERCHE_H

#include <QDialog>

namespace Ui {
class recherche;
}

class recherche : public QDialog
{
    Q_OBJECT

public:
    explicit recherche(QWidget *parent = nullptr);
    ~recherche();

private:
    Ui::recherche *ui;
};

#endif // RECHERCHE_H
