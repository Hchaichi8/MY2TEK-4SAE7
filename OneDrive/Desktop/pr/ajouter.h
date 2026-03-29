#ifndef AJOUTER_H
#define AJOUTER_H

#include <QDialog>

namespace Ui {
class ajouter;
}

class ajouter : public QDialog
{
    Q_OBJECT

public:
    explicit ajouter(QWidget *parent = nullptr);
    ~ajouter();

private:
    Ui::ajouter *ui;
};

#endif // AJOUTER_H
