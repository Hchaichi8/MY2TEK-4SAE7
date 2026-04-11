#ifndef AJOUT_H
#define AJOUT_H

#include <QDialog>

namespace Ui {
class ajout;
}

class ajout : public QDialog
{
    Q_OBJECT

public:
    explicit ajout(QWidget *parent = nullptr);
    ~ajout();

private:
    Ui::ajout *ui;
};

#endif // AJOUT_H
